import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowLeft,
  CheckCheck,
  CircleAlert,
  LoaderCircle,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  RefreshCw,
  Search,
  Send,
  X,
} from "lucide-react";

import { supabase } from "../auth/supabaseClient";
import { useAuth } from "../auth/AuthContext";
import "./UserChatScreen.css";

const REQUEST_TIMEOUT_MS = 8000;

function withTimeout(request, timeout = REQUEST_TIMEOUT_MS) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(
        new Error(
          "The messaging request took too long. Please try again.",
        ),
      );
    }, timeout);
  });

  return Promise.race([
    Promise.resolve(request),
    timeoutPromise,
  ]).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

function formatListTime(value) {
  if (!value) return "";

  const date = new Date(value);
  const now = new Date();

  const sameDate =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDate) {
    return date.toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

function formatMessageTime(value) {
  if (!value) return "";

  return new Date(value).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function initials(value = "") {
  return (
    value
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "TA"
  );
}

function isAgencyType(value) {
  const normalized = String(value || "").toLowerCase();

  return (
    normalized.includes("agency") ||
    normalized.includes("travel agent") ||
    normalized.includes("travelagency")
  );
}

function getInquiryDetails(inquiry) {
  if (!inquiry) return null;

  const item = inquiry.item || {};
  const attachedAgency = inquiry.agency || {};
  const isPackage = inquiry.type === "tour";

  const agencyId = isPackage
    ? item.agency_id || attachedAgency.agency_id
    : item.agency_id;

  if (!agencyId) return null;

  return {
    agencyId,
    packageId: isPackage ? item.package_id || null : null,
    packageTitle: isPackage ? item.title || null : null,
    agencyName: isPackage
      ? attachedAgency.name || null
      : item.name || null,
    tripId: item.trip_id || null,
  };
}

function AgencyAvatar({ profile, size = "normal" }) {
  return (
    <div className={`agency-chat-avatar ${size}`}>
      {profile?.profile_picture_url ? (
        <img
          src={profile.profile_picture_url}
          alt={profile.full_name || "Travel agency"}
        />
      ) : (
        <span>{initials(profile?.full_name)}</span>
      )}
    </div>
  );
}

function LoadingState({ label = "Loading conversations..." }) {
  return (
    <div className="agency-chat-loading">
      <LoaderCircle className="spin" size={28} />
      <strong>{label}</strong>
      <span>
        This will stop automatically if Supabase does not respond.
      </span>
    </div>
  );
}

function EmptyState({ onRefresh }) {
  return (
    <div className="agency-chat-empty">
      <div className="agency-chat-empty-icon">
        <MessageCircle size={31} />
      </div>

      <h2>No agency conversations yet</h2>

      <p>
        Open a tour package or travel agency and press
        <strong> Inquire</strong> to begin.
      </p>

      <button type="button" onClick={onRefresh}>
        <RefreshCw size={16} />
        Refresh messages
      </button>
    </div>
  );
}

export default function UserChatScreen({
  onBack,
  initialInquiry = null,
  inquiryContext = null,
}) {
  const { user } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [messageValue, setMessageValue] = useState("");
  const [error, setError] = useState("");

  const endRef = useRef(null);
  const mountedRef = useRef(true);
  const handledInquiryRef = useRef("");

  const selectedRoom = useMemo(
    () =>
      rooms.find((room) => room.room_id === selectedRoomId) ||
      null,
    [rooms, selectedRoomId],
  );

  const visibleRooms = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return rooms.filter((room) => {
      const name = room.agency?.full_name?.toLowerCase() || "";
      const preview =
        room.lastMessage?.message_text?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        name.includes(query) ||
        preview.includes(query);

      if (!matchesSearch) return false;

      if (activeFilter === "unread") {
        return room.unreadCount > 0;
      }

      return true;
    });
  }, [rooms, searchValue, activeFilter]);

  const loadRooms = useCallback(
    async ({ showLoader = true } = {}) => {
      if (!user?.id) {
        setLoadingRooms(false);
        setRooms([]);
        return [];
      }

      if (showLoader) setLoadingRooms(true);
      setError("");

      try {
        const myParticipationResult = await withTimeout(
          supabase
            .from("chatroom_participants")
            .select("room_id,user_id,user_type")
            .eq("user_id", user.id),
        );

        if (myParticipationResult.error) {
          throw myParticipationResult.error;
        }

        const myParticipations =
          myParticipationResult.data || [];

        const roomIds = [
          ...new Set(
            myParticipations
              .map((participant) => participant.room_id)
              .filter(Boolean),
          ),
        ];

        if (!roomIds.length) {
          if (mountedRef.current) {
            setRooms([]);
            setSelectedRoomId(null);
          }

          return [];
        }

        const [
          roomResult,
          participantResult,
          messageResult,
        ] = await withTimeout(
          Promise.all([
            supabase
              .from("chat_rooms")
              .select("room_id,trip_id,created_at")
              .in("room_id", roomIds),

            supabase
              .from("chatroom_participants")
              .select("room_id,user_id,user_type")
              .in("room_id", roomIds),

            supabase
              .from("messages")
              .select(
                "message_id,room_id,sender_id,message_text,is_read,created_at",
              )
              .in("room_id", roomIds)
              .order("created_at", { ascending: false })
              .limit(1000),
          ]),
        );

        if (roomResult.error) throw roomResult.error;
        if (participantResult.error) {
          throw participantResult.error;
        }
        if (messageResult.error) throw messageResult.error;

        const allParticipants =
          participantResult.data || [];

        const agencyParticipants = allParticipants.filter(
          (participant) =>
            participant.user_id !== user.id &&
            isAgencyType(participant.user_type),
        );

        const agencyUserIds = [
          ...new Set(
            agencyParticipants
              .map((participant) => participant.user_id)
              .filter(Boolean),
          ),
        ];

        const profileResult = agencyUserIds.length
          ? await withTimeout(
              supabase
                .from("users")
                .select(
                  "user_id,email,full_name,profile_picture_url,user_type,is_verified",
                )
                .in("user_id", agencyUserIds),
            )
          : { data: [], error: null };

        if (profileResult.error) throw profileResult.error;

        const profileMap = new Map(
          (profileResult.data || []).map((profile) => [
            profile.user_id,
            profile,
          ]),
        );

        const messagesByRoom = new Map();

        for (const message of messageResult.data || []) {
          if (!messagesByRoom.has(message.room_id)) {
            messagesByRoom.set(message.room_id, []);
          }

          messagesByRoom.get(message.room_id).push(message);
        }

        const hydratedRooms = (roomResult.data || [])
          .map((room) => {
            const roomParticipants = allParticipants.filter(
              (participant) =>
                participant.room_id === room.room_id,
            );

            const agencyParticipant =
              roomParticipants.find(
                (participant) =>
                  participant.user_id !== user.id &&
                  isAgencyType(participant.user_type),
              ) || null;

            if (!agencyParticipant) {
              return null;
            }

            const roomMessages =
              messagesByRoom.get(room.room_id) || [];
            const lastMessage = roomMessages[0] || null;

            const unreadCount = roomMessages.filter(
              (message) =>
                message.sender_id !== user.id &&
                message.is_read !== true,
            ).length;

            return {
              ...room,
              agencyParticipant,
              agency:
                profileMap.get(
                  agencyParticipant.user_id,
                ) || null,
              lastMessage,
              unreadCount,
            };
          })
          .filter(Boolean)
          .sort((first, second) => {
            const firstDate = new Date(
              first.lastMessage?.created_at ||
                first.created_at ||
                0,
            ).getTime();

            const secondDate = new Date(
              second.lastMessage?.created_at ||
                second.created_at ||
                0,
            ).getTime();

            return secondDate - firstDate;
          });

        if (mountedRef.current) {
          setRooms(hydratedRooms);

          setSelectedRoomId((current) => {
            if (
              current &&
              hydratedRooms.some(
                (room) => room.room_id === current,
              )
            ) {
              return current;
            }

            return null;
          });
        }

        return hydratedRooms;
      } catch (loadError) {
        console.error("Agency chat room load error:", loadError);

        if (mountedRef.current) {
          setRooms([]);
          setError(
            loadError?.message ||
              "Conversations could not be loaded.",
          );
        }

        return [];
      } finally {
        if (mountedRef.current) {
          setLoadingRooms(false);
        }
      }
    },
    [user?.id],
  );

  const loadMessages = useCallback(
    async (roomId, { showLoader = true } = {}) => {
      if (!roomId) {
        setMessages([]);
        return [];
      }

      if (showLoader) setLoadingMessages(true);
      setError("");

      try {
        const result = await withTimeout(
          supabase
            .from("messages")
            .select(
              "message_id,room_id,sender_id,message_text,is_read,created_at",
            )
            .eq("room_id", roomId)
            .order("created_at", { ascending: true }),
        );

        if (result.error) throw result.error;

        const rows = result.data || [];

        if (mountedRef.current) {
          setMessages(rows);
        }

        const unreadIds = rows
          .filter(
            (message) =>
              message.sender_id !== user?.id &&
              message.is_read !== true,
          )
          .map((message) => message.message_id);

        if (unreadIds.length) {
          const updateResult = await withTimeout(
            supabase
              .from("messages")
              .update({ is_read: true })
              .in("message_id", unreadIds),
          );

          if (updateResult.error) {
            console.warn(
              "Unread messages could not be updated:",
              updateResult.error,
            );
          }
        }

        return rows;
      } catch (loadError) {
        console.error("Agency chat message load error:", loadError);

        if (mountedRef.current) {
          setMessages([]);
          setError(
            loadError?.message ||
              "Messages could not be loaded.",
          );
        }

        return [];
      } finally {
        if (mountedRef.current) {
          setLoadingMessages(false);
        }
      }
    },
    [user?.id],
  );

  const openRoom = useCallback(
    async (room) => {
      if (!room) return;

      setSelectedRoomId(room.room_id);
      setMessages([]);

      await loadMessages(room.room_id);

      setRooms((current) =>
        current.map((item) =>
          item.room_id === room.room_id
            ? { ...item, unreadCount: 0 }
            : item,
        ),
      );
    },
    [loadMessages],
  );

  const resolvePublicUser = useCallback(
    async (userId) => {
      const result = await withTimeout(
        supabase
          .from("users")
          .select(
            "user_id,email,full_name,profile_picture_url,user_type,is_verified",
          )
          .eq("user_id", userId)
          .maybeSingle(),
      );

      if (result.error) throw result.error;
      return result.data;
    },
    [],
  );

  const createOrOpenInquiry = useCallback(
    async (inquiry) => {
      if (!user?.id) return;

      const details = getInquiryDetails(inquiry);
      if (!details) return;

      const inquiryKey = [
        details.agencyId,
        details.packageId || "general",
      ].join(":");

      if (handledInquiryRef.current === inquiryKey) return;
      handledInquiryRef.current = inquiryKey;

      setError("");

      try {
        const agencyResult = await withTimeout(
          supabase
            .from("travel_agencies")
            .select(
              "agency_id,name,logo_url,owner_user_id,is_active",
            )
            .eq("agency_id", details.agencyId)
            .maybeSingle(),
        );

        if (agencyResult.error) throw agencyResult.error;

        const agency = agencyResult.data;

        if (!agency?.owner_user_id) {
          throw new Error(
            `${agency?.name || "This travel agency"} does not have a messaging account assigned yet.`,
          );
        }

        const [travelerProfile, agencyProfile] =
          await Promise.all([
            resolvePublicUser(user.id),
            resolvePublicUser(agency.owner_user_id),
          ]);

        if (!travelerProfile) {
          throw new Error(
            "Your public user profile is missing. Create the matching public.users record first.",
          );
        }

        if (!agencyProfile) {
          throw new Error(
            "The agency owner does not have a public.users profile.",
          );
        }

        const myParticipationResult = await withTimeout(
          supabase
            .from("chatroom_participants")
            .select("room_id,user_id,user_type")
            .eq("user_id", user.id),
        );

        if (myParticipationResult.error) {
          throw myParticipationResult.error;
        }

        const myRoomIds = [
          ...new Set(
            (myParticipationResult.data || []).map(
              (participant) => participant.room_id,
            ),
          ),
        ];

        let existingRoomId = null;

        if (myRoomIds.length) {
          const agencyParticipationResult =
            await withTimeout(
              supabase
                .from("chatroom_participants")
                .select("room_id,user_id,user_type")
                .eq("user_id", agency.owner_user_id)
                .in("room_id", myRoomIds),
            );

          if (agencyParticipationResult.error) {
            throw agencyParticipationResult.error;
          }

          existingRoomId =
            agencyParticipationResult.data?.[0]?.room_id ||
            null;
        }

        let targetRoomId = existingRoomId;

        if (!targetRoomId) {
          const roomInsertResult = await withTimeout(
            supabase
              .from("chat_rooms")
              .insert({
                trip_id: details.tripId,
              })
              .select("room_id,trip_id,created_at")
              .single(),
          );

          if (roomInsertResult.error) {
            throw roomInsertResult.error;
          }

          targetRoomId = roomInsertResult.data.room_id;

          const participantInsertResult =
            await withTimeout(
              supabase
                .from("chatroom_participants")
                .insert([
                  {
                    room_id: targetRoomId,
                    user_id: travelerProfile.user_id,
                    user_type: travelerProfile.user_type,
                  },
                  {
                    room_id: targetRoomId,
                    user_id: agencyProfile.user_id,
                    user_type: agencyProfile.user_type,
                  },
                ]),
            );

          if (participantInsertResult.error) {
            throw participantInsertResult.error;
          }
        }

        const openingText = details.packageTitle
          ? `Hi! I’m interested in the “${details.packageTitle}” package. Could you please share the current availability, inclusions, booking requirements, and final price?`
          : `Hi! I’d like to inquire about the travel services offered by ${details.agencyName || agency.name}.`;

        const existingMessagesResult = await withTimeout(
          supabase
            .from("messages")
            .select("message_id")
            .eq("room_id", targetRoomId)
            .limit(1),
        );

        if (existingMessagesResult.error) {
          throw existingMessagesResult.error;
        }

        if (
          !existingRoomId ||
          !(existingMessagesResult.data || []).length
        ) {
          const openingMessageResult = await withTimeout(
            supabase.from("messages").insert({
              room_id: targetRoomId,
              sender_id: user.id,
              message_text: openingText,
              is_read: false,
            }),
          );

          if (openingMessageResult.error) {
            throw openingMessageResult.error;
          }
        }

        const refreshedRooms = await loadRooms({
          showLoader: false,
        });

        const targetRoom =
          refreshedRooms.find(
            (room) => room.room_id === targetRoomId,
          ) || {
            room_id: targetRoomId,
            agency: agencyProfile,
          };

        await openRoom(targetRoom);
      } catch (inquiryError) {
        console.error(
          "Agency inquiry creation error:",
          inquiryError,
        );

        setError(
          inquiryError?.message ||
            "The agency conversation could not be opened.",
        );
      }
    },
    [
      loadRooms,
      openRoom,
      resolvePublicUser,
      user?.id,
    ],
  );

  useEffect(() => {
    mountedRef.current = true;
    loadRooms();

    return () => {
      mountedRef.current = false;
    };
  }, [loadRooms]);

  useEffect(() => {
    const inquiry = initialInquiry || inquiryContext;

    if (inquiry && !loadingRooms) {
      createOrOpenInquiry(inquiry);
    }
  }, [
    initialInquiry,
    inquiryContext,
    loadingRooms,
    createOrOpenInquiry,
  ]);

  useEffect(() => {
    const channel = supabase
      .channel(`agency-messages-${user?.id || "guest"}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const incoming = payload.new;

          loadRooms({ showLoader: false });

          if (incoming.room_id === selectedRoomId) {
            setMessages((current) => {
              if (
                current.some(
                  (message) =>
                    message.message_id ===
                    incoming.message_id,
                )
              ) {
                return current;
              }

              return [...current, incoming];
            });

            if (
              incoming.sender_id !== user?.id &&
              incoming.is_read !== true
            ) {
              supabase
                .from("messages")
                .update({ is_read: true })
                .eq("message_id", incoming.message_id)
                .then(({ error: updateError }) => {
                  if (updateError) {
                    console.warn(
                      "Realtime read update failed:",
                      updateError,
                    );
                  }
                });
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    loadRooms,
    selectedRoomId,
    user?.id,
  ]);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loadingMessages]);

  async function sendMessage(event) {
    event.preventDefault();

    const text = messageValue.trim();

    if (
      !text ||
      !selectedRoomId ||
      !user?.id ||
      sending
    ) {
      return;
    }

    setSending(true);
    setError("");
    setMessageValue("");

    const optimisticId = `optimistic-${Date.now()}`;

    setMessages((current) => [
      ...current,
      {
        message_id: optimisticId,
        room_id: selectedRoomId,
        sender_id: user.id,
        message_text: text,
        is_read: false,
        created_at: new Date().toISOString(),
        optimistic: true,
      },
    ]);

    try {
      const result = await withTimeout(
        supabase
          .from("messages")
          .insert({
            room_id: selectedRoomId,
            sender_id: user.id,
            message_text: text,
            is_read: false,
          })
          .select(
            "message_id,room_id,sender_id,message_text,is_read,created_at",
          )
          .single(),
      );

      if (result.error) throw result.error;

      setMessages((current) =>
        current.map((message) =>
          message.message_id === optimisticId
            ? result.data
            : message,
        ),
      );

      await loadRooms({ showLoader: false });
    } catch (sendError) {
      console.error("Agency message send error:", sendError);

      setMessages((current) =>
        current.filter(
          (message) =>
            message.message_id !== optimisticId,
        ),
      );

      setMessageValue(text);
      setError(
        sendError?.message ||
          "The message could not be sent.",
      );
    } finally {
      setSending(false);
    }
  }

  const threadOpen = Boolean(selectedRoom);

  return (
    <section
      className={`agency-chat-screen ${
        threadOpen ? "thread-open" : ""
      }`}
    >
      <aside className="agency-chat-sidebar">
        <header className="agency-chat-sidebar-header">
          <div>
            <h1>Messages</h1>
            <p>Chat with travel agencies</p>
          </div>

          {onBack && (
            <button
              type="button"
              className="agency-chat-close-screen"
              onClick={onBack}
              aria-label="Close Messages"
            >
              <X size={19} />
            </button>
          )}
        </header>

        <label className="agency-chat-search">
          <Search size={17} />

          <input
            value={searchValue}
            onChange={(event) =>
              setSearchValue(event.target.value)
            }
            placeholder="Search agencies or messages"
          />
        </label>

        <div className="agency-chat-filters">
          <button
            type="button"
            className={
              activeFilter === "all" ? "active" : ""
            }
            onClick={() => setActiveFilter("all")}
          >
            All
          </button>

          <button
            type="button"
            className={
              activeFilter === "unread" ? "active" : ""
            }
            onClick={() => setActiveFilter("unread")}
          >
            Unread
          </button>
        </div>

        {error && (
          <div className="agency-chat-error">
            <CircleAlert size={18} />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="agency-chat-conversation-list">
          {loadingRooms ? (
            <LoadingState />
          ) : visibleRooms.length ? (
            visibleRooms.map((room) => (
              <button
                type="button"
                key={room.room_id}
                className={`agency-chat-conversation ${
                  room.room_id === selectedRoomId
                    ? "active"
                    : ""
                }`}
                onClick={() => openRoom(room)}
              >
                <AgencyAvatar profile={room.agency} />

                <span className="agency-chat-conversation-copy">
                  <span className="agency-chat-conversation-topline">
                    <strong>
                      {room.agency?.full_name ||
                        "Travel Agency"}
                    </strong>

                    <time>
                      {formatListTime(
                        room.lastMessage?.created_at ||
                          room.created_at,
                      )}
                    </time>
                  </span>

                  <span className="agency-chat-conversation-subject">
                    {room.agency?.is_verified
                      ? "Verified travel agency"
                      : "Travel agency"}
                  </span>

                  <span className="agency-chat-conversation-preview">
                    {room.lastMessage?.message_text ||
                      "Start the conversation"}
                  </span>
                </span>

                {room.unreadCount > 0 && (
                  <span className="agency-chat-unread">
                    {room.unreadCount > 99
                      ? "99+"
                      : room.unreadCount}
                  </span>
                )}
              </button>
            ))
          ) : (
            <EmptyState
              onRefresh={() => loadRooms()}
            />
          )}
        </div>
      </aside>

      <main className="agency-chat-thread">
        {selectedRoom ? (
          <>
            <header className="agency-chat-thread-header">
              <button
                type="button"
                className="agency-chat-mobile-back"
                onClick={() => {
                  setSelectedRoomId(null);
                  setMessages([]);
                }}
                aria-label="Back to conversations"
              >
                <ArrowLeft size={20} />
              </button>

              <AgencyAvatar
                profile={selectedRoom.agency}
                size="small"
              />

              <div className="agency-chat-thread-title">
                <strong>
                  {selectedRoom.agency?.full_name ||
                    "Travel Agency"}
                </strong>

                <span>
                  {selectedRoom.agency?.is_verified
                    ? "Verified agency"
                    : "Agency conversation"}
                </span>
              </div>

              <button
                type="button"
                className="agency-chat-more"
                aria-label="Conversation options"
              >
                <MoreHorizontal size={20} />
              </button>
            </header>

            <div className="agency-chat-message-area">
              {loadingMessages ? (
                <LoadingState label="Loading messages..." />
              ) : messages.length ? (
                <div className="agency-chat-message-list">
                  {messages.map((message) => {
                    const isUser =
                      message.sender_id === user?.id;

                    return (
                      <article
                        key={message.message_id}
                        className={`agency-chat-message-row ${
                          isUser ? "user" : "agency"
                        }`}
                      >
                        {!isUser && (
                          <AgencyAvatar
                            profile={selectedRoom.agency}
                            size="tiny"
                          />
                        )}

                        <div className="agency-chat-message-group">
                          <div className="agency-chat-bubble">
                            {message.message_text}
                          </div>

                          <div className="agency-chat-message-meta">
                            <time>
                              {formatMessageTime(
                                message.created_at,
                              )}
                            </time>

                            {isUser && (
                              <CheckCheck
                                size={13}
                                className={
                                  message.optimistic
                                    ? "pending"
                                    : ""
                                }
                              />
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  <div ref={endRef} />
                </div>
              ) : (
                <div className="agency-chat-start">
                  <AgencyAvatar
                    profile={selectedRoom.agency}
                  />

                  <h2>
                    Start a conversation with{" "}
                    {selectedRoom.agency?.full_name ||
                      "this agency"}
                  </h2>

                  <p>
                    Ask about availability, package
                    inclusions, payment terms, requirements,
                    and custom travel arrangements.
                  </p>
                </div>
              )}
            </div>

            <form
              className="agency-chat-composer"
              onSubmit={sendMessage}
            >
              <button
                type="button"
                title="Attachment support can be added later"
                aria-label="Attach a file"
              >
                <Paperclip size={19} />
              </button>

              <textarea
                rows={1}
                maxLength={2000}
                value={messageValue}
                onChange={(event) =>
                  setMessageValue(event.target.value)
                }
                placeholder="Type a message..."
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    sendMessage(event);
                  }
                }}
              />

              <button
                type="submit"
                className="agency-chat-send"
                disabled={!messageValue.trim() || sending}
                aria-label="Send message"
              >
                {sending ? (
                  <LoaderCircle
                    className="spin"
                    size={19}
                  />
                ) : (
                  <Send size={19} />
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="agency-chat-thread-placeholder">
            <div>
              <MessageCircle size={33} />
            </div>

            <h2>Select a conversation</h2>

            <p>
              Choose a travel agency from the inbox to view
              and continue the conversation.
            </p>
          </div>
        )}
      </main>
    </section>
  );
}

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
  } from "react";
  import {
    ArrowLeft,
    Camera,
    Check,
    Download,
    Heart,
    ImagePlus,
    LoaderCircle,
    MapPin,
    Plus,
    Share2,
    Sparkles,
    Trash2,
    Upload,
    UsersRound,
    X,
  } from "lucide-react";
  
  import { supabase } from "../auth/supabaseClient";
  import { useAuth } from "../auth/AuthContext";
  import "./passport.css";
  
  const STORAGE_BUCKET = "trip-passport";
  const MAX_PHOTOS_PER_TRIP = 30;
  const MAX_PHOTOS_PER_USER = 10;
  const MAX_UPLOAD_MB = 12;
  const TARGET_IMAGE_BYTES = 650 * 1024;
  const MAX_IMAGE_EDGE = 1600;
  
  const EMOJI_AVATARS = [
    "🧑🏻",
    "👩🏻",
    "👨🏽",
    "👩🏽",
    "🧔🏻",
    "🧕🏽",
    "👩🏾‍🦱",
    "👨🏻‍🦱",
    "👩🏼‍🦰",
    "🧑🏿",
    "🤓",
    "😎",
  ];
  
  function moneylessDate(value) {
    if (!value) return "Date not set";
  
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  
  function safeName(value = "") {
    return String(value)
      .trim()
      .replace(/[^a-z0-9._-]+/gi, "-")
      .replace(/-+/g, "-")
      .toLowerCase();
  }
  
  function emojiFor(seed = "traveler") {
    const score = String(seed)
      .split("")
      .reduce((total, character) => total + character.charCodeAt(0), 0);
  
    return EMOJI_AVATARS[score % EMOJI_AVATARS.length];
  }
  
  function PersonAvatar({ person, label, className = "" }) {
    const name =
      label ||
      person?.full_name ||
      person?.email ||
      "Traveler";
  
    return (
      <span className={className} title={name}>
        {person?.profile_picture_url ? (
          <img src={person.profile_picture_url} alt={name} />
        ) : (
          <span className="passport-emoji-avatar">{emojiFor(name)}</span>
        )}
      </span>
    );
  }
  
  async function fileToImage(file) {
    const url = URL.createObjectURL(file);
  
    try {
      const image = new Image();
      image.decoding = "async";
  
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
      });
  
      return image;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  
  async function compressImage(file) {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files can be added to the passport.");
    }
  
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      throw new Error(`Each original image must be smaller than ${MAX_UPLOAD_MB} MB.`);
    }
  
    const sourceImage = await fileToImage(file);
    const ratio = Math.min(
      1,
      MAX_IMAGE_EDGE / Math.max(sourceImage.width, sourceImage.height),
    );
  
    const width = Math.max(1, Math.round(sourceImage.width * ratio));
    const height = Math.max(1, Math.round(sourceImage.height * ratio));
  
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
  
    const context = canvas.getContext("2d", {
      alpha: false,
    });
  
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(sourceImage, 0, 0, width, height);
  
    let quality = 0.84;
    let blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );
  
    while (blob && blob.size > TARGET_IMAGE_BYTES && quality > 0.48) {
      quality -= 0.08;
      blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/webp", quality),
      );
    }
  
    if (!blob) {
      throw new Error("The selected image could not be compressed.");
    }
  
    return new File(
      [blob],
      `${safeName(file.name.replace(/\.[^.]+$/, "")) || "memory"}.webp`,
      {
        type: "image/webp",
        lastModified: Date.now(),
      },
    );
  }
  
  async function loadImageFromUrl(url) {
    const response = await fetch(url);
  
    if (!response.ok) {
      throw new Error("A collage image could not be loaded.");
    }
  
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
  
    try {
      const image = new Image();
      image.decoding = "async";
  
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = objectUrl;
      });
  
      return image;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }
  
  function drawCover(context, image, x, y, width, height) {
    const sourceRatio = image.width / image.height;
    const targetRatio = width / height;
  
    let sourceWidth = image.width;
    let sourceHeight = image.height;
    let sourceX = 0;
    let sourceY = 0;
  
    if (sourceRatio > targetRatio) {
      sourceWidth = image.height * targetRatio;
      sourceX = (image.width - sourceWidth) / 2;
    } else {
      sourceHeight = image.width / targetRatio;
      sourceY = (image.height - sourceHeight) / 2;
    }
  
    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x,
      y,
      width,
      height,
    );
  }
  
  export default function PassportScreen() {
    const { user } = useAuth();
  
    const [passportOpen, setPassportOpen] = useState(false);
    const [trips, setTrips] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [people, setPeople] = useState({});
    const [membersByTrip, setMembersByTrip] = useState({});
    const [selectedTripId, setSelectedTripId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingAlbum, setLoadingAlbum] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [savingUpload, setSavingUpload] = useState(false);
    const [creatingCollage, setCreatingCollage] = useState(false);
    const [error, setError] = useState("");
  
    const selectedTrip = useMemo(
      () => trips.find((trip) => trip.trip_id === selectedTripId) || null,
      [trips, selectedTripId],
    );
  
    const selectedAlbum = useMemo(
      () => albums.find((album) => album.trip_id === selectedTripId) || null,
      [albums, selectedTripId],
    );
  
    const selectedPhotos = useMemo(
      () => photos.filter((photo) => photo.trip_id === selectedTripId),
      [photos, selectedTripId],
    );
  
    const totalPhotos = photos.length;
  
    const loadPassport = useCallback(async () => {
      if (!user?.id) return;
  
      setLoading(true);
      setError("");
  
      try {
        const { data: tripRows, error: tripsError } = await supabase
          .from("trips")
          .select(
            "trip_id,user_id,trip_name,destination,start_date,end_date,cover_image_url,created_at",
          )
          .order("start_date", { ascending: false, nullsFirst: false });
  
        if (tripsError) throw tripsError;
  
        const normalizedTrips = tripRows || [];
        const tripIds = normalizedTrips.map((trip) => trip.trip_id);
  
        if (!tripIds.length) {
          setTrips([]);
          setAlbums([]);
          setPhotos([]);
          setPeople({});
          setMembersByTrip({});
          return;
        }
  
        const [albumResult, photoResult, memberResult] = await Promise.all([
          supabase
            .from("trip_albums")
            .select("*")
            .in("trip_id", tripIds),
          supabase
            .from("trip_album_photos")
            .select("*")
            .in("trip_id", tripIds)
            .order("created_at", { ascending: false }),
          supabase
            .from("trip_members")
            .select("member_id,trip_id,user_id,status")
            .in("trip_id", tripIds),
        ]);
  
        if (albumResult.error) throw albumResult.error;
        if (photoResult.error) throw photoResult.error;
        if (memberResult.error) throw memberResult.error;
  
        const photoRows = photoResult.data || [];
        const memberRows = (memberResult.data || []).filter((membership) =>
          ["accepted", "joined"].includes(
            String(membership.status || "").toLowerCase(),
          ),
        );
  
        const userIds = [
          ...new Set([
            user.id,
            ...normalizedTrips.map((trip) => trip.user_id),
            ...photoRows.map((photo) => photo.uploaded_by),
            ...memberRows.map((membership) => membership.user_id),
          ]),
        ].filter(Boolean);
  
        let userMap = {};
  
        if (userIds.length) {
          const { data: userRows, error: usersError } = await supabase
            .from("users")
            .select("user_id,full_name,email,profile_picture_url")
            .in("user_id", userIds);
  
          if (usersError) throw usersError;
  
          userMap = Object.fromEntries(
            (userRows || []).map((person) => [person.user_id, person]),
          );
        }
  
        const signedPhotos = await Promise.all(
          photoRows.map(async (photo) => {
            const { data } = await supabase.storage
              .from(STORAGE_BUCKET)
              .createSignedUrl(photo.storage_path, 60 * 60);
  
            return {
              ...photo,
              signed_url: data?.signedUrl || null,
            };
          }),
        );
  
        const groupedMembers = {};
  
        normalizedTrips.forEach((trip) => {
          groupedMembers[trip.trip_id] = [
            {
              user_id: trip.user_id,
              person: userMap[trip.user_id] || null,
              role: "owner",
            },
            ...memberRows
              .filter((membership) => membership.trip_id === trip.trip_id)
              .filter((membership) => membership.user_id !== trip.user_id)
              .map((membership) => ({
                user_id: membership.user_id,
                person: userMap[membership.user_id] || null,
                role: "member",
              })),
          ];
        });
  
        setTrips(normalizedTrips);
        setAlbums(albumResult.data || []);
        setPhotos(signedPhotos);
        setPeople(userMap);
        setMembersByTrip(groupedMembers);
      } catch (loadError) {
        console.error("Passport load error:", loadError);
        setError(loadError.message || "The travel passport could not be loaded.");
      } finally {
        setLoading(false);
      }
    }, [user?.id]);
  
    useEffect(() => {
      loadPassport();
    }, [loadPassport]);
  
    async function ensureAlbum(trip) {
      const existing = albums.find((album) => album.trip_id === trip.trip_id);
  
      if (existing) return existing;
  
      const { data, error: createError } = await supabase
        .from("trip_albums")
        .insert({
          trip_id: trip.trip_id,
          created_by: user.id,
          album_name:
            trip.trip_name ||
            `${trip.destination || "Trip"} Memories`,
        })
        .select()
        .single();
  
      if (createError) {
        if (createError.code === "23505") {
          const { data: existingAlbum, error: readError } = await supabase
            .from("trip_albums")
            .select("*")
            .eq("trip_id", trip.trip_id)
            .single();
  
          if (readError) throw readError;
          return existingAlbum;
        }
  
        throw createError;
      }
  
      setAlbums((current) => [...current, data]);
      return data;
    }
  
    async function submitUpload({ files, caption, locationName, takenAt }) {
      if (!selectedTrip || !files.length) return;
  
      setSavingUpload(true);
      setError("");
  
      try {
        const currentTripPhotos = photos.filter(
          (photo) => photo.trip_id === selectedTrip.trip_id,
        );
        const currentUserPhotos = currentTripPhotos.filter(
          (photo) => photo.uploaded_by === user.id,
        );
  
        if (
          currentTripPhotos.length + files.length >
          MAX_PHOTOS_PER_TRIP
        ) {
          throw new Error(
            `This trip can contain up to ${MAX_PHOTOS_PER_TRIP} memories.`,
          );
        }
  
        if (
          currentUserPhotos.length + files.length >
          MAX_PHOTOS_PER_USER
        ) {
          throw new Error(
            `Each contributor can add up to ${MAX_PHOTOS_PER_USER} memories per trip.`,
          );
        }
  
        const album = await ensureAlbum(selectedTrip);
        const newRows = [];
  
        for (const originalFile of files) {
          const compressedFile = await compressImage(originalFile);
          const photoId = crypto.randomUUID?.() ||
            `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  
          const storagePath = `${selectedTrip.trip_id}/${user.id}/${photoId}.webp`;
  
          const { error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, compressedFile, {
              contentType: "image/webp",
              upsert: false,
            });
  
          if (uploadError) throw uploadError;
  
          const { data: photoRow, error: insertError } = await supabase
            .from("trip_album_photos")
            .insert({
              photo_id: photoId,
              album_id: album.album_id,
              trip_id: selectedTrip.trip_id,
              uploaded_by: user.id,
              storage_path: storagePath,
              caption: caption.trim() || null,
              location_name: locationName.trim() || null,
              taken_at: takenAt || null,
            })
            .select()
            .single();
  
          if (insertError) {
            await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
            throw insertError;
          }
  
          const { data: signedData } = await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(storagePath, 60 * 60);
  
          newRows.push({
            ...photoRow,
            signed_url: signedData?.signedUrl || null,
          });
        }
  
        setPhotos((current) => [...newRows, ...current]);
        setUploadOpen(false);
      } catch (uploadError) {
        console.error("Passport upload error:", uploadError);
        setError(uploadError.message || "The memory could not be uploaded.");
      } finally {
        setSavingUpload(false);
      }
    }
  
    async function toggleFavorite(photo) {
      const nextValue = !photo.is_favorite;
  
      setPhotos((current) =>
        current.map((item) =>
          item.photo_id === photo.photo_id
            ? { ...item, is_favorite: nextValue }
            : item,
        ),
      );
  
      const { error: updateError } = await supabase
        .from("trip_album_photos")
        .update({ is_favorite: nextValue })
        .eq("photo_id", photo.photo_id);
  
      if (updateError) {
        setError(updateError.message);
        loadPassport();
      }
    }
  
    async function deletePhoto(photo) {
      const isOwner = selectedTrip?.user_id === user.id;
      const isUploader = photo.uploaded_by === user.id;
  
      if (!isOwner && !isUploader) return;
  
      const confirmed = window.confirm("Remove this memory from the shared album?");
      if (!confirmed) return;
  
      setPhotos((current) =>
        current.filter((item) => item.photo_id !== photo.photo_id),
      );
  
      const { error: deleteError } = await supabase
        .from("trip_album_photos")
        .delete()
        .eq("photo_id", photo.photo_id);
  
      if (deleteError) {
        setError(deleteError.message);
        loadPassport();
        return;
      }
  
      await supabase.storage.from(STORAGE_BUCKET).remove([photo.storage_path]);
    }
  
    async function createAndShareCollage() {
      if (!selectedTrip || !selectedPhotos.length) return;
  
      setCreatingCollage(true);
      setError("");
  
      try {
        const collagePhotos = selectedPhotos
          .filter((photo) => photo.signed_url)
          .slice(0, 6);
  
        const images = await Promise.all(
          collagePhotos.map((photo) => loadImageFromUrl(photo.signed_url)),
        );
  
        const canvas = document.createElement("canvas");
        canvas.width = 1080;
        canvas.height = 1350;
  
        const context = canvas.getContext("2d");
        const gradient = context.createLinearGradient(0, 0, 1080, 1350);
        gradient.addColorStop(0, "#fff1f7");
        gradient.addColorStop(0.52, "#f7f3ff");
        gradient.addColorStop(1, "#eaf5ff");
  
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
  
        context.fillStyle = "#13203d";
        context.font = "700 68px Arial";
        context.fillText(
          selectedTrip.trip_name ||
            `${selectedTrip.destination || "Trip"} Memories`,
          72,
          100,
        );
  
        context.fillStyle = "#68738a";
        context.font = "32px Arial";
        context.fillText(
          `${selectedPhotos.length} memories • shared on TRAVA AI`,
          74,
          150,
        );
  
        const gap = 22;
        const startY = 210;
        const cellWidth = (1080 - 72 * 2 - gap) / 2;
        const cellHeight = 430;
  
        images.forEach((image, index) => {
          const column = index % 2;
          const row = Math.floor(index / 2);
          const x = 72 + column * (cellWidth + gap);
          const y = startY + row * (cellHeight + gap);
  
          context.save();
          context.beginPath();
          context.roundRect(x, y, cellWidth, cellHeight, 30);
          context.clip();
          drawCover(context, image, x, y, cellWidth, cellHeight);
          context.restore();
        });
  
        context.fillStyle = "#526078";
        context.font = "28px Arial";
        context.fillText("Your journey. Your story.", 72, 1300);
  
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png", 0.95),
        );
  
        if (!blob) {
          throw new Error("The collage could not be generated.");
        }
  
        const file = new File(
          [blob],
          `${safeName(selectedTrip.trip_name || selectedTrip.destination)}-trava-collage.png`,
          {
            type: "image/png",
          },
        );
  
        if (
          navigator.share &&
          navigator.canShare?.({ files: [file] })
        ) {
          await navigator.share({
            files: [file],
            title:
              selectedTrip.trip_name ||
              `${selectedTrip.destination || "Trip"} Memories`,
            text: "Shared from my TRAVA AI travel passport.",
          });
        } else {
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = file.name;
          anchor.click();
          URL.revokeObjectURL(url);
        }
      } catch (collageError) {
        if (collageError?.name !== "AbortError") {
          setError(collageError.message || "The collage could not be created.");
        }
      } finally {
        setCreatingCollage(false);
      }
    }
  
    if (selectedTrip) {
      return (
        <TripAlbumView
          trip={selectedTrip}
          album={selectedAlbum}
          photos={selectedPhotos}
          people={people}
          members={membersByTrip[selectedTrip.trip_id] || []}
          currentUserId={user.id}
          loading={loadingAlbum}
          error={error}
          creatingCollage={creatingCollage}
          onBack={() => setSelectedTripId(null)}
          onAdd={() => setUploadOpen(true)}
          onFavorite={toggleFavorite}
          onDelete={deletePhoto}
          onShare={createAndShareCollage}
          onDismissError={() => setError("")}
          uploadModal={
            uploadOpen ? (
              <MemoryUploadModal
                saving={savingUpload}
                onClose={() => setUploadOpen(false)}
                onSubmit={submitUpload}
              />
            ) : null
          }
        />
      );
    }
  
    return (
      <div className="scroll-area passport-screen">
        <header className="passport-page-header">
          <div>
            <span>TRAVEL MEMORIES</span>
            <h1>Passport</h1>
          </div>
  
          <div className="passport-header-count">
            <strong>{totalPhotos}</strong>
            <span>memories</span>
          </div>
        </header>
  
        {error && (
          <div className="passport-error">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}
  
        <section
          className={`passport-book-stage ${passportOpen ? "open" : ""}`}
        >
          <button
            type="button"
            className="passport-cover-button"
            onClick={() => setPassportOpen(true)}
            aria-label="Open travel passport"
          >
            <div className="passport-cover">
              <span className="passport-cover-kicker">TRAVA AI</span>
              <strong>PASSPORT</strong>
  
              <div className="passport-globe-emblem">
                <span>✦</span>
                <div>◎</div>
              </div>
  
              <p>Your Journey. Your Story.</p>
  
              <small>
                {trips.length} {trips.length === 1 ? "trip" : "trips"} collected
              </small>
            </div>
          </button>
  
          <div className="passport-open-book">
            <button
              type="button"
              className="passport-close-book"
              onClick={() => setPassportOpen(false)}
            >
              <X size={18} />
            </button>
  
            <div className="passport-page passport-page-left">
              <div className="passport-page-heading">
                <span>TRAVA AI</span>
                <strong>MEMORIES PASSPORT</strong>
              </div>
  
              <div className="passport-folder-grid">
                {trips
                  .filter((_, index) => index % 2 === 0)
                  .map((trip) => (
                    <TripFolder
                      key={trip.trip_id}
                      trip={trip}
                      photos={photos.filter(
                        (photo) => photo.trip_id === trip.trip_id,
                      )}
                      members={membersByTrip[trip.trip_id] || []}
                      onOpen={() => setSelectedTripId(trip.trip_id)}
                    />
                  ))}
              </div>
            </div>
  
            <div className="passport-book-spine" />
  
            <div className="passport-page passport-page-right">
              <div className="passport-page-stamp">TRAVEL MORE ✈</div>
  
              <div className="passport-folder-grid">
                {trips
                  .filter((_, index) => index % 2 === 1)
                  .map((trip) => (
                    <TripFolder
                      key={trip.trip_id}
                      trip={trip}
                      photos={photos.filter(
                        (photo) => photo.trip_id === trip.trip_id,
                      )}
                      members={membersByTrip[trip.trip_id] || []}
                      onOpen={() => setSelectedTripId(trip.trip_id)}
                    />
                  ))}
              </div>
            </div>
          </div>
        </section>
  
        {!passportOpen && (
          <div className="passport-open-caption">
            <Sparkles size={18} />
            Tap the passport to open your shared trip albums
          </div>
        )}
  
        {passportOpen && !loading && trips.length === 0 && (
          <div className="passport-empty">
            <Camera size={35} />
            <strong>No trip albums yet</strong>
            <span>Create a trip first. Its shared passport album will appear here automatically.</span>
          </div>
        )}
  
        {loading && (
          <div className="passport-loading">
            <LoaderCircle className="spin" size={28} />
            Loading your passport...
          </div>
        )}
      </div>
    );
  }
  
  function TripFolder({ trip, photos, members, onOpen }) {
    const previewPhotos = photos.filter((photo) => photo.signed_url).slice(0, 3);
  
    return (
      <button type="button" className="passport-trip-folder" onClick={onOpen}>
        <div className="passport-folder-previews">
          {previewPhotos.map((photo, index) => (
            <img
              key={photo.photo_id}
              src={photo.signed_url}
              alt={photo.caption || trip.destination || "Trip memory"}
              style={{
                "--preview-index": index,
              }}
            />
          ))}
  
          {!previewPhotos.length && trip.cover_image_url && (
            <img
              src={trip.cover_image_url}
              alt={trip.destination || trip.trip_name}
              style={{
                "--preview-index": 0,
              }}
            />
          )}
        </div>
  
        <div className="passport-folder-front">
          <div className="passport-folder-stickers">
            <span>✈</span>
            <span>📍</span>
          </div>
  
          <strong>
            {trip.trip_name || `${trip.destination || "Trip"} Memories`}
          </strong>
  
          <small>{photos.length} memories</small>
  
          <div className="passport-folder-members">
            {members.slice(0, 3).map((membership) => (
              <PersonAvatar
                key={membership.user_id}
                person={membership.person}
                label={membership.person?.full_name || "Traveler"}
                className="passport-folder-avatar"
              />
            ))}
  
            {members.length > 3 && <span>+{members.length - 3}</span>}
          </div>
        </div>
      </button>
    );
  }
  
  function TripAlbumView({
    trip,
    photos,
    people,
    members,
    currentUserId,
    error,
    creatingCollage,
    onBack,
    onAdd,
    onFavorite,
    onDelete,
    onShare,
    onDismissError,
    uploadModal,
  }) {
    return (
      <div className="scroll-area passport-album-view">
        <header className="passport-album-header">
          <button type="button" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
  
          <div>
            <span>SHARED TRIP ALBUM</span>
            <h1>{trip.trip_name || trip.destination || "Trip Memories"}</h1>
            <p>
              {moneylessDate(trip.start_date)} · {photos.length}/{MAX_PHOTOS_PER_TRIP} memories
            </p>
          </div>
  
          <button type="button" onClick={onAdd}>
            <ImagePlus size={20} />
          </button>
        </header>
  
        <section className="passport-contributors-card">
          <div className="passport-contributor-stack">
            {members.slice(0, 5).map((membership) => (
              <PersonAvatar
                key={membership.user_id}
                person={membership.person}
                label={membership.person?.full_name || "Traveler"}
                className="passport-contributor-avatar"
              />
            ))}
          </div>
  
          <div>
            <strong>{members.length || 1} contributors</strong>
            <span>Everyone accepted on this trip can add memories.</span>
          </div>
  
          <button type="button" onClick={onShare} disabled={!photos.length || creatingCollage}>
            {creatingCollage ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <Share2 size={17} />
            )}
            Share collage
          </button>
        </section>
  
        {error && (
          <div className="passport-error">
            <span>{error}</span>
            <button type="button" onClick={onDismissError}>
              <X size={16} />
            </button>
          </div>
        )}
  
        {photos.length ? (
          <section className="passport-memory-grid">
            {photos.map((photo) => {
              const uploader = people[photo.uploaded_by];
              const canDelete =
                trip.user_id === currentUserId ||
                photo.uploaded_by === currentUserId;
  
              return (
                <article key={photo.photo_id} className="passport-memory-card">
                  <img
                    src={photo.signed_url}
                    alt={photo.caption || "Travel memory"}
                  />
  
                  <button
                    type="button"
                    className={photo.is_favorite ? "favorite" : ""}
                    onClick={() => onFavorite(photo)}
                  >
                    <Heart
                      size={18}
                      fill={photo.is_favorite ? "currentColor" : "none"}
                    />
                  </button>
  
                  <div className="passport-memory-overlay">
                    <div className="passport-memory-uploader">
                      <PersonAvatar
                        person={uploader}
                        label={uploader?.full_name || "Traveler"}
                        className="passport-memory-avatar"
                      />
  
                      <div>
                        <strong>{uploader?.full_name || uploader?.email || "Traveler"}</strong>
                        <span>{photo.location_name || "Location not added"}</span>
                      </div>
                    </div>
  
                    {photo.caption && <p>{photo.caption}</p>}
  
                    {canDelete && (
                      <button
                        type="button"
                        className="passport-delete-memory"
                        onClick={() => onDelete(photo)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="passport-album-empty">
            <Camera size={40} />
            <h2>Start this trip’s shared story</h2>
            <p>Add compressed photos, captions, and locations. Accepted trip members will see the same album.</p>
            <button type="button" onClick={onAdd}>
              <Plus size={18} />
              Add the first memories
            </button>
          </section>
        )}
  
        <button type="button" className="passport-floating-add" onClick={onAdd}>
          <Plus size={24} />
        </button>
  
        {uploadModal}
      </div>
    );
  }
  
  function MemoryUploadModal({ saving, onClose, onSubmit }) {
    const [files, setFiles] = useState([]);
    const [caption, setCaption] = useState("");
    const [locationName, setLocationName] = useState("");
    const [takenAt, setTakenAt] = useState("");
  
    function submit(event) {
      event.preventDefault();
      onSubmit({
        files,
        caption,
        locationName,
        takenAt: takenAt || null,
      });
    }
  
    return (
      <div className="passport-modal-backdrop" onMouseDown={onClose}>
        <form
          className="passport-upload-modal"
          onSubmit={submit}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header>
            <div>
              <span>NEW MEMORIES</span>
              <h2>Add to the shared album</h2>
            </div>
  
            <button type="button" onClick={onClose}>
              <X size={20} />
            </button>
          </header>
  
          <label className="passport-file-picker">
            <Upload size={27} />
            <strong>Choose photos</strong>
            <span>
              Up to {MAX_PHOTOS_PER_USER} per contributor, automatically compressed.
            </span>
  
            <input
              required
              multiple
              type="file"
              accept="image/*"
              onChange={(event) =>
                setFiles(Array.from(event.target.files || []))
              }
            />
          </label>
  
          {files.length > 0 && (
            <div className="passport-selected-files">
              {files.map((file) => (
                <span key={`${file.name}-${file.lastModified}`}>
                  <Check size={14} />
                  {file.name}
                </span>
              ))}
            </div>
          )}
  
          <label>
            Caption
            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="What made this moment special?"
            />
          </label>
  
          <label>
            Location
            <div className="passport-input-icon">
              <MapPin size={17} />
              <input
                value={locationName}
                onChange={(event) => setLocationName(event.target.value)}
                placeholder="Shibuya, Tokyo"
              />
            </div>
          </label>
  
          <label>
            Date taken
            <input
              type="datetime-local"
              value={takenAt}
              onChange={(event) => setTakenAt(event.target.value)}
            />
          </label>
  
          <footer>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
  
            <button type="submit" disabled={!files.length || saving}>
              {saving ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <ImagePlus size={18} />
              )}
              {saving ? "Uploading..." : "Add memories"}
            </button>
          </footer>
        </form>
      </div>
    );
  }
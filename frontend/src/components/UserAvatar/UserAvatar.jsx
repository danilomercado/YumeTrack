// Avatar de usuario: la imagen elegida (portada o personaje) o la inicial.
const UserAvatar = ({
  name,
  src,
  size = "h-11 w-11",
  text = "text-base",
  tone = "bg-accent text-paper",
}) => {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={`shrink-0 rounded-full bg-panel-2 object-cover object-top ${size}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${tone} ${size} ${text}`}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
};

export default UserAvatar;

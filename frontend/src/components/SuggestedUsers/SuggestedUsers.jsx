import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSuggestionsRequest } from "../../services/socialService";
import {
  followUserRequest,
  unfollowUserRequest,
} from "../../services/followService";
import { useToast } from "../../context/ToastContext";

// A quién seguir: usuarios con lista y seguidores que todavía no seguís.
const SuggestedUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState({});

  useEffect(() => {
    let cancelled = false;

    getSuggestionsRequest()
      .then((data) => {
        if (!cancelled) setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (users.length === 0) return null;

  const toggle = async (user) => {
    const was = Boolean(following[user.id]);
    setFollowing((prev) => ({ ...prev, [user.id]: !was }));

    try {
      if (was) {
        await unfollowUserRequest(user.id);
      } else {
        await followUserRequest(user.id);
        toast(`Ahora seguís a ${user.userName}`);
      }
    } catch (error) {
      setFollowing((prev) => ({ ...prev, [user.id]: was }));
      toast(error.message || "No se pudo actualizar", "error");
    }
  };

  return (
    <div>
      <h3 className="text-lg text-paper">A quién seguir</h3>

      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {users.map((user, index) => (
          <li
            key={user.id}
            style={{ "--i": index }}
            className="stagger-item flex items-center gap-3 rounded-2xl bg-panel-2 p-3"
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold ${
                user.id % 2 ? "bg-accent text-paper" : "bg-paper text-ground"
              }`}
            >
              {user.userName.charAt(0).toUpperCase()}
            </span>

            <div className="min-w-0 flex-1">
              <Link
                to={`/profile/${user.userName}`}
                className="block truncate text-sm font-bold text-paper hover:text-accent-soft"
              >
                {user.userName}
              </Link>
              <p className="text-[13px] text-zinc-400">
                {user.titlesCount} títulos · {user.followersCount} seguidores
              </p>
            </div>

            <button
              type="button"
              onClick={() => toggle(user)}
              className={`springy rounded-full px-4 py-1.5 text-[13px] font-bold hover:scale-105 ${
                following[user.id]
                  ? "bg-white/10 text-zinc-200"
                  : "bg-paper text-ground hover:bg-accent hover:text-paper"
              }`}
            >
              {following[user.id] ? "Siguiendo" : "+ Seguir"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SuggestedUsers;

import { useId, useState } from "react";

const UsersAutocomplete = ({
  users = [],
  onSearch = () => {},
  onSelect = () => {},
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const listId = useId();
  const query = searchTerm.trim().toLowerCase();

  const getName = (user) => {
    return (
      user.fullName ||
      [user.givenName, user.familyName].filter(Boolean).join(" ")
    );
  };

  const matchingUsers = users
    .filter((user) => {
      const name = getName(user).toLowerCase();
      const email = (user.email || "").toLowerCase();

      return (
        query.length >= 2 && (name.includes(query) || email.includes(query))
      );
    })
    .slice(0, 10);

  const isOpen = showDropdown && query.length >= 2;

  const handleChange = (event) => {
    const value = event.target.value;

    setSearchTerm(value);
    setShowDropdown(true);
    setSelectedIndex(-1);
    onSearch(value);
  };

  const handleSelect = (user) => {
    setSearchTerm(getName(user));
    setShowDropdown(false);
    setSelectedIndex(-1);
    onSelect(user);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setShowDropdown(false);
      return;
    }

    if (!isOpen || matchingUsers.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((index) =>
        Math.min(index + 1, matchingUsers.length - 1),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && selectedIndex >= 0) {
      event.preventDefault();
      handleSelect(matchingUsers[selectedIndex]);
    }
  };

  return (
    <div
      className="position-relative"
      style={{ maxWidth: "500px" }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setShowDropdown(false);
        }
      }}
    >
      <label htmlFor={`${listId}-input`} className="form-label">
        Search users by name or email
      </label>

      <input
        id={`${listId}-input`}
        type="text"
        className="form-control"
        placeholder="Enter name or email"
        value={searchTerm}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowDropdown(true)}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-activedescendant={
          isOpen && selectedIndex >= 0
            ? `${listId}-${selectedIndex}`
            : undefined
        }
      />

      {isOpen && (
        <div
          id={listId}
          role="listbox"
          className="list-group position-absolute w-100 shadow-sm"
          style={{ zIndex: 1000 }}
        >
          {matchingUsers.length === 0 ? (
            <div className="list-group-item">No matching users</div>
          ) : (
            matchingUsers.map((user, index) => (
              <button
                id={`${listId}-${index}`}
                key={user.id}
                type="button"
                role="option"
                aria-selected={selectedIndex === index}
                className="list-group-item list-group-item-action"
                onClick={() => handleSelect(user)}
              >
                <strong>{getName(user)}</strong>
                <div className="text-muted">{user.email}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UsersAutocomplete;

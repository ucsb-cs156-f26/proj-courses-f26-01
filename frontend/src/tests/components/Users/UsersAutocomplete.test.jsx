import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import UsersAutocomplete from "main/components/Users/UsersAutocomplete";
import usersFixtures from "fixtures/usersFixtures";

const users = usersFixtures.threeUsers;

describe("UsersAutocomplete tests", () => {
  test("renders the search input", () => {
    render(<UsersAutocomplete users={users} />);

    expect(
      screen.getByLabelText("Search users by name or email"),
    ).toBeInTheDocument();
  });

  test("does not show suggestions for one character", async () => {
    render(<UsersAutocomplete users={users} />);

    await userEvent.type(screen.getByRole("combobox"), "p");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  test("searches by name ignoring case", async () => {
    render(<UsersAutocomplete users={users} />);

    await userEvent.type(screen.getByRole("combobox"), "PHILL");

    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByText("Phill Conrad")).toBeInTheDocument();
    expect(screen.getByText("Phillip Conrad")).toBeInTheDocument();
  });

  test("searches by email", async () => {
    render(<UsersAutocomplete users={users} />);

    await userEvent.type(screen.getByRole("combobox"), "example.org");

    expect(screen.getByText("Craig Zzyxx")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });

  test("shows a message when no users match", async () => {
    render(<UsersAutocomplete users={users} />);

    await userEvent.type(screen.getByRole("combobox"), "unknown");

    expect(screen.getByText("No matching users")).toBeInTheDocument();
  });

  test("calls onSearch when typing", async () => {
    const onSearch = vi.fn();

    render(<UsersAutocomplete users={users} onSearch={onSearch} />);

    await userEvent.type(screen.getByRole("combobox"), "craig");

    expect(onSearch).toHaveBeenLastCalledWith("craig");
  });

  test("selects a user when clicked", async () => {
    const onSelect = vi.fn();

    render(<UsersAutocomplete users={users} onSelect={onSelect} />);

    await userEvent.type(screen.getByRole("combobox"), "craig");

    await userEvent.click(screen.getByRole("option"));

    expect(onSelect).toHaveBeenCalledWith(users[2]);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  test("selects a user using the keyboard", async () => {
    const onSelect = vi.fn();

    render(<UsersAutocomplete users={users} onSelect={onSelect} />);

    await userEvent.type(
      screen.getByRole("combobox"),
      "craig{ArrowDown}{Enter}",
    );

    expect(onSelect).toHaveBeenCalledWith(users[2]);
  });

  test("closes suggestions when Escape is pressed", async () => {
    render(<UsersAutocomplete users={users} />);

    await userEvent.type(screen.getByRole("combobox"), "craig");

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  test("works when no users are provided", async () => {
    render(<UsersAutocomplete />);

    await userEvent.type(screen.getByRole("combobox"), "unknown");

    expect(screen.getByText("No matching users")).toBeInTheDocument();
  });

  test("handles users without a full name or email", async () => {
    const partialUsers = [{ id: 4, givenName: "Ada", familyName: "Lovelace" }];

    render(<UsersAutocomplete users={partialUsers} />);

    await userEvent.type(screen.getByRole("combobox"), "ada");

    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("option"));

    expect(screen.getByRole("combobox")).toHaveValue("Ada Lovelace");
  });

  test("supports navigating suggestions with arrow keys", async () => {
    const onSelect = vi.fn();

    render(<UsersAutocomplete users={users} onSelect={onSelect} />);

    await userEvent.type(
      screen.getByRole("combobox"),
      "phill{ArrowDown}{ArrowDown}{ArrowUp}{Enter}",
    );

    expect(onSelect).toHaveBeenCalledWith(users[0]);
  });

  test("ignores arrow keys when no users match", async () => {
    const onSelect = vi.fn();

    render(<UsersAutocomplete users={users} onSelect={onSelect} />);

    await userEvent.type(
      screen.getByRole("combobox"),
      "unknown{ArrowDown}{Enter}",
    );

    expect(screen.getByText("No matching users")).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();
  });

  test("closes suggestions when clicking outside", async () => {
    render(
      <>
        <UsersAutocomplete users={users} />
        <button type="button">Outside</button>
      </>,
    );

    await userEvent.type(screen.getByRole("combobox"), "craig");

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Outside" }));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  test("shows suggestions with exactly two characters", async () => {
    render(<UsersAutocomplete users={users} />);

    await userEvent.type(screen.getByRole("combobox"), "ph");

    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  test("ignores spaces around the search term", async () => {
    render(<UsersAutocomplete users={users} />);

    await userEvent.type(screen.getByRole("combobox"), "  phill  ");

    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  test("limits suggestions to ten users", async () => {
    const manyUsers = Array.from({ length: 12 }, (_, index) => ({
      id: index,
      fullName: `Alice ${index}`,
      email: `alice${index}@example.com`,
    }));

    render(<UsersAutocomplete users={manyUsers} />);

    await userEvent.type(screen.getByRole("combobox"), "alice");

    expect(screen.getAllByRole("option")).toHaveLength(10);
  });

  test("does not select without choosing a suggestion", async () => {
    const onSelect = vi.fn();

    render(<UsersAutocomplete users={users} onSelect={onSelect} />);

    await userEvent.type(screen.getByRole("combobox"), "phill{Enter}");

    expect(onSelect).not.toHaveBeenCalled();
  });

  test("ArrowUp does not go before first result", async () => {
    const onSelect = vi.fn();

    render(<UsersAutocomplete users={users} onSelect={onSelect} />);

    await userEvent.type(
      screen.getByRole("combobox"),
      "phill{ArrowDown}{ArrowUp}{Enter}",
    );

    expect(onSelect).toHaveBeenCalledWith(users[0]);
  });

  test("ArrowDown does not go past last result", async () => {
    const onSelect = vi.fn();

    render(<UsersAutocomplete users={users} onSelect={onSelect} />);

    await userEvent.type(
      screen.getByRole("combobox"),
      "phill{ArrowDown}{ArrowDown}{ArrowDown}{Enter}",
    );

    expect(onSelect).toHaveBeenCalledWith(users[1]);
  });

  test("updates accessibility selection attributes", async () => {
    render(<UsersAutocomplete users={users} />);

    const input = screen.getByRole("combobox");

    await userEvent.type(input, "phill");

    const options = screen.getAllByRole("option");

    expect(input).not.toHaveAttribute("aria-activedescendant");

    await userEvent.keyboard("{ArrowDown}");

    expect(options[0]).toHaveClass("active");
    expect(options[1]).toHaveClass("list-group-item list-group-item-action", {
      exact: true,
    });
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(options[1]).toHaveAttribute("aria-selected", "false");
    expect(input).toHaveAttribute("aria-activedescendant", options[0].id);

    await userEvent.keyboard("{ArrowDown}");

    expect(options[0]).toHaveClass("list-group-item list-group-item-action", {
      exact: true,
    });
    expect(options[1]).toHaveClass("active");
    expect(options[0]).toHaveAttribute("aria-selected", "false");
    expect(options[1]).toHaveAttribute("aria-selected", "true");
    expect(input).toHaveAttribute("aria-activedescendant", options[1].id);
  });

  test("reopens dropdown when input is focused again", async () => {
    render(<UsersAutocomplete users={users} />);

    const input = screen.getByRole("combobox");

    await userEvent.type(input, "phill");
    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    await userEvent.tab();
    await userEvent.click(input);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  test("handles a user with only a last name", async () => {
    const partialUsers = [
      { id: 10, familyName: "Lovelace", email: "ada@example.com" },
    ];

    render(<UsersAutocomplete users={partialUsers} />);

    await userEvent.type(screen.getByRole("combobox"), "love");

    expect(screen.getByRole("option").querySelector("strong").textContent).toBe(
      "Lovelace",
    );
  });

  test("does not match missing email values", async () => {
    const partialUsers = [{ id: 10, givenName: "Ada", familyName: "Lovelace" }];

    render(<UsersAutocomplete users={partialUsers} />);

    await userEvent.type(screen.getByRole("combobox"), "stryker");

    expect(screen.getByText("No matching users")).toBeInTheDocument();
  });

  test("does not prevent arrow keys when suggestions are unavailable", async () => {
    render(<UsersAutocomplete users={users} />);

    const input = screen.getByRole("combobox");

    await userEvent.type(input, "unknown");

    const noMatchEvent = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });

    fireEvent(input, noMatchEvent);
    expect(noMatchEvent.defaultPrevented).toBe(false);

    await userEvent.clear(input);
    await userEvent.type(input, "phill");
    await userEvent.keyboard("{Escape}");

    const closedEvent = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });

    fireEvent(input, closedEvent);
    expect(closedEvent.defaultPrevented).toBe(false);
  });

  test("does not select when another key is pressed", async () => {
    const onSelect = vi.fn();

    render(<UsersAutocomplete users={users} onSelect={onSelect} />);

    await userEvent.type(screen.getByRole("combobox"), "phill{ArrowDown}");

    await userEvent.keyboard("{Tab}");

    expect(onSelect).not.toHaveBeenCalled();
  });

  test("resets selected index after selection", async () => {
    render(<UsersAutocomplete users={users} />);

    const input = screen.getByRole("combobox");

    await userEvent.type(input, "phill{ArrowDown}{Enter}");

    await userEvent.tab();
    await userEvent.click(input);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });

  test("uses the expected dropdown styles", async () => {
    render(<UsersAutocomplete users={users} />);

    const input = screen.getByRole("combobox");

    expect(input.parentElement).toHaveStyle({
      maxWidth: "500px",
    });

    await userEvent.type(input, "phill");

    expect(screen.getByRole("listbox")).toHaveStyle({
      zIndex: "1000",
    });
  });
});

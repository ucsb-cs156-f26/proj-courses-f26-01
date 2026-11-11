import { render, screen } from "@testing-library/react";
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
});

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import usersFixtures from "fixtures/usersFixtures";
import AdminUsersPage from "main/pages/Admin/AdminUsersPage";

describe("AdminUsersPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "UsersTable";

  const renderPage = () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AdminUsersPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  const getSearchInput = () =>
    screen.getByRole("combobox", {
      name: "Search users by name or email",
    });

  const findSearchOption = async () => {
    const listbox = await screen.findByRole("listbox");
    return within(listbox).findByRole("option", {}, { timeout: 3000 });
  };

  const getSearchOption = () => {
    const listbox = screen.getByRole("listbox");
    return within(listbox).getByRole("option");
  };

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing on three users", async () => {
    axiosMock.onGet("/api/admin/users").reply(200, {
      content: usersFixtures.threeUsers,
      totalPages: 2,
    });

    renderPage();

    expect(await screen.findByText("Users")).toBeInTheDocument();

    expect(
      await screen.findByTestId("UsersTable-cell-row-0-col-id"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("UsersTable-cell-row-0-col-id"),
    ).toHaveTextContent("1");

    expect(
      screen.getByTestId("UsersTable-cell-row-0-col-givenName"),
    ).toHaveTextContent("Phill");

    expect(
      screen.getByTestId("UsersTable-cell-row-0-col-familyName"),
    ).toHaveTextContent("Conrad");

    expect(
      screen.getByTestId("UsersTable-cell-row-0-col-email"),
    ).toHaveTextContent("phtcon@ucsb.edu");

    expect(
      screen.getByTestId("UsersTable-cell-row-0-col-admin"),
    ).toHaveTextContent("true");

    expect(screen.getByTestId("OurPagination-2")).toBeInTheDocument();

    const usersRequest = axiosMock.history.get.find(
      (request) => request.url === "/api/admin/users",
    );

    expect(usersRequest.params).toEqual({
      page: 0,
      pageSize: "10",
      sortField: "email",
      sortDirection: "ASC",
    });
  });

  test("clicking pagination requests the second page", async () => {
    axiosMock.onGet("/api/admin/users").reply((config) => {
      if (config.params.page === 1) {
        return [
          200,
          {
            content: [usersFixtures.threeUsers[1]],
            totalPages: 2,
          },
        ];
      }

      return [
        200,
        {
          content: [usersFixtures.threeUsers[0]],
          totalPages: 2,
        },
      ];
    });

    renderPage();

    expect(
      await screen.findByTestId("UsersTable-cell-row-0-col-email"),
    ).toHaveTextContent("phtcon@ucsb.edu");

    fireEvent.click(screen.getByTestId("OurPagination-2"));

    await waitFor(() => {
      expect(
        screen.getByTestId("UsersTable-cell-row-0-col-email"),
      ).toHaveTextContent("pconrad.cis@gmail.com");
    });

    const usersRequests = axiosMock.history.get.filter(
      (request) => request.url === "/api/admin/users",
    );

    expect(usersRequests).toHaveLength(2);

    expect(usersRequests[1].params).toEqual({
      page: 1,
      pageSize: "10",
      sortField: "email",
      sortDirection: "ASC",
    });
  });

  test("reads pageSize, sortField, sortDirection from localStorage", async () => {
    localStorage.setItem("UsersSearch.PageSize", "25");
    localStorage.setItem("UsersSearch.SortField", "familyName");
    localStorage.setItem("UsersSearch.SortDirection", "DESC");

    axiosMock.onGet("/api/admin/users").reply(200, {
      content: usersFixtures.threeUsers,
      totalPages: 2,
    });

    renderPage();

    expect(await screen.findByText("Users")).toBeInTheDocument();

    const usersRequest = axiosMock.history.get.find(
      (request) => request.url === "/api/admin/users",
    );

    expect(usersRequest.params).toEqual({
      page: 0,
      pageSize: "25",
      sortField: "familyName",
      sortDirection: "DESC",
    });

    localStorage.clear();
  });

  test("renders empty table when backend unavailable", async () => {
    axiosMock.onGet("/api/admin/users").timeout();

    const restoreConsole = mockConsole();

    renderPage();

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];

    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/admin/users",
    );

    restoreConsole();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();

    expect(screen.queryByTestId("OurPagination-1")).not.toBeInTheDocument();
  });

  test("searches users and filters table after selecting a result", async () => {
    axiosMock.onGet("/api/admin/users").reply(200, {
      content: usersFixtures.threeUsers,
      totalPages: 2,
    });

    axiosMock.onGet("/api/admin/users/search").reply((config) => {
      expect(config.params).toEqual({ query: "pconrad" });
      return [200, [usersFixtures.threeUsers[1]]];
    });

    renderPage();

    expect(
      await screen.findByTestId("UsersTable-cell-row-0-col-email"),
    ).toHaveTextContent("phtcon@ucsb.edu");

    const input = getSearchInput();

    fireEvent.change(input, {
      target: { value: "pconrad" },
    });

    const option = await findSearchOption();

    expect(option).toHaveTextContent("pconrad.cis@gmail.com");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    fireEvent.click(option);

    await waitFor(() => {
      expect(
        screen.getByTestId("UsersTable-cell-row-0-col-email"),
      ).toHaveTextContent("pconrad.cis@gmail.com");
    });

    expect(screen.queryByTestId("OurPagination-2")).not.toBeInTheDocument();

    fireEvent.change(input, {
      target: { value: "" },
    });

    await waitFor(() => {
      expect(
        screen.getByTestId("UsersTable-cell-row-0-col-email"),
      ).toHaveTextContent("phtcon@ucsb.edu");
    });

    expect(screen.getByTestId("OurPagination-2")).toBeInTheDocument();
  });

  test("shows no matching users when search returns empty results", async () => {
    axiosMock.onGet("/api/admin/users").reply(200, {
      content: usersFixtures.threeUsers,
      totalPages: 2,
    });

    axiosMock.onGet("/api/admin/users/search").reply(200, []);

    renderPage();

    fireEvent.change(getSearchInput(), {
      target: { value: "unknownuser" },
    });

    expect(await screen.findByText("No matching users")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        axiosMock.history.get.filter(
          (request) => request.url === "/api/admin/users/search",
        ),
      ).toHaveLength(1);
    });
  });

  test("shows error message when autocomplete request fails", async () => {
    axiosMock.onGet("/api/admin/users").reply(200, {
      content: usersFixtures.threeUsers,
      totalPages: 2,
    });

    axiosMock.onGet("/api/admin/users/search").reply(500);

    renderPage();

    fireEvent.change(getSearchInput(), {
      target: { value: "phill" },
    });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to search users. Please try again.",
    );
  });

  test("ignores old search results when a newer search finishes", async () => {
    let finishFirstSearch;

    axiosMock.onGet("/api/admin/users").reply(200, {
      content: usersFixtures.threeUsers,
      totalPages: 2,
    });

    axiosMock.onGet("/api/admin/users/search").reply((config) => {
      if (config.params.query === "phill") {
        return new Promise((resolve) => {
          finishFirstSearch = resolve;
        });
      }

      return [200, [usersFixtures.threeUsers[1]]];
    });

    renderPage();

    const input = getSearchInput();

    fireEvent.change(input, {
      target: { value: "phill" },
    });

    await waitFor(() => {
      expect(finishFirstSearch).toBeDefined();
    });

    fireEvent.change(input, {
      target: { value: "pconrad" },
    });

    await waitFor(() => {
      const requests = axiosMock.history.get.filter(
        (request) => request.url === "/api/admin/users/search",
      );

      expect(requests.map((request) => request.params.query)).toContain(
        "pconrad",
      );
    });

    expect(await findSearchOption()).toHaveTextContent("pconrad.cis@gmail.com");

    await act(async () => {
      finishFirstSearch([200, [usersFixtures.threeUsers[0]]]);
    });

    expect(getSearchOption()).toHaveTextContent("pconrad.cis@gmail.com");
  });

  test("ignores errors from an outdated search", async () => {
    let finishFirstSearch;

    axiosMock.onGet("/api/admin/users").reply(200, {
      content: usersFixtures.threeUsers,
      totalPages: 2,
    });

    axiosMock.onGet("/api/admin/users/search").reply((config) => {
      if (config.params.query === "phill") {
        return new Promise((resolve) => {
          finishFirstSearch = resolve;
        });
      }

      return [200, [usersFixtures.threeUsers[1]]];
    });

    renderPage();

    const input = getSearchInput();

    fireEvent.change(input, {
      target: { value: "phill" },
    });

    await waitFor(() => {
      expect(finishFirstSearch).toBeDefined();
    });

    fireEvent.change(input, {
      target: { value: "pconrad" },
    });

    await waitFor(() => {
      const requests = axiosMock.history.get.filter(
        (request) => request.url === "/api/admin/users/search",
      );

      expect(requests.map((request) => request.params.query)).toContain(
        "pconrad",
      );
    });

    expect(await findSearchOption()).toHaveTextContent("pconrad.cis@gmail.com");

    await act(async () => {
      finishFirstSearch([500]);
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    expect(getSearchOption()).toHaveTextContent("pconrad.cis@gmail.com");
  });

  test("cancels an earlier debounce when typing a new query", async () => {
    axiosMock.onGet("/api/admin/users").reply(200, {
      content: usersFixtures.threeUsers,
      totalPages: 2,
    });

    axiosMock
      .onGet("/api/admin/users/search")
      .reply(200, [usersFixtures.threeUsers[1]]);

    renderPage();

    const input = getSearchInput();

    fireEvent.change(input, {
      target: { value: "phill" },
    });

    fireEvent.change(input, {
      target: { value: "pconrad" },
    });

    await waitFor(() => {
      const requests = axiosMock.history.get.filter(
        (request) => request.url === "/api/admin/users/search",
      );

      expect(requests).toHaveLength(1);
      expect(requests[0].params.query).toBe("pconrad");
    });

    expect(await findSearchOption()).toHaveTextContent("pconrad.cis@gmail.com");
  });

  test("clears search errors after typing a new valid query", async () => {
    axiosMock.onGet("/api/admin/users").reply(200, {
      content: usersFixtures.threeUsers,
      totalPages: 2,
    });

    axiosMock.onGet("/api/admin/users/search").reply((config) => {
      if (config.params.query === "phill") {
        return [500];
      }

      return [200, [usersFixtures.threeUsers[1]]];
    });

    renderPage();

    const input = getSearchInput();

    fireEvent.change(input, {
      target: { value: "phill" },
    });

    expect(await screen.findByRole("alert")).toBeInTheDocument();

    fireEvent.change(input, {
      target: { value: "pconrad" },
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await waitFor(() => {
      const requests = axiosMock.history.get.filter(
        (request) => request.url === "/api/admin/users/search",
      );

      expect(requests.map((request) => request.params.query)).toContain(
        "pconrad",
      );
    });

    expect(await findSearchOption()).toHaveTextContent("pconrad.cis@gmail.com");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("does not search until two characters are entered", async () => {
    axiosMock.onGet("/api/admin/users").reply(200, {
      content: usersFixtures.threeUsers,
      totalPages: 2,
    });

    axiosMock
      .onGet("/api/admin/users/search")
      .reply(200, [usersFixtures.threeUsers[1]]);

    renderPage();

    const input = getSearchInput();

    expect(input).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    const getSearchRequests = () =>
      axiosMock.history.get.filter(
        (request) => request.url === "/api/admin/users/search",
      );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });

    expect(getSearchRequests()).toHaveLength(0);

    fireEvent.change(input, {
      target: { value: "p" },
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });

    expect(getSearchRequests()).toHaveLength(0);

    fireEvent.change(input, {
      target: { value: "pc" },
    });

    await waitFor(() => {
      expect(getSearchRequests()).toHaveLength(1);
    });

    expect(getSearchRequests()[0].params).toEqual({
      query: "pc",
    });
  });

  test("trims whitespace before sending search request", async () => {
    axiosMock.onGet("/api/admin/users").reply(200, {
      content: usersFixtures.threeUsers,
      totalPages: 2,
    });

    axiosMock
      .onGet("/api/admin/users/search")
      .reply(200, [usersFixtures.threeUsers[1]]);

    renderPage();

    fireEvent.change(getSearchInput(), {
      target: { value: "  pc  " },
    });

    await waitFor(() => {
      const requests = axiosMock.history.get.filter(
        (request) => request.url === "/api/admin/users/search",
      );

      expect(requests).toHaveLength(1);
      expect(requests[0].params).toEqual({
        query: "pc",
      });
    });
  });

  test("does not search again after selecting a user", async () => {
    axiosMock.onGet("/api/admin/users").reply(200, {
      content: usersFixtures.threeUsers,
      totalPages: 2,
    });

    axiosMock
      .onGet("/api/admin/users/search")
      .reply(200, [usersFixtures.threeUsers[1]]);

    renderPage();

    fireEvent.change(getSearchInput(), {
      target: { value: "pconrad" },
    });

    const option = await findSearchOption();

    expect(option).toHaveTextContent("pconrad.cis@gmail.com");

    const getSearchRequests = () =>
      axiosMock.history.get.filter(
        (request) => request.url === "/api/admin/users/search",
      );

    expect(getSearchRequests()).toHaveLength(1);

    fireEvent.click(option);

    await waitFor(() => {
      expect(
        screen.getByTestId("UsersTable-cell-row-0-col-email"),
      ).toHaveTextContent("pconrad.cis@gmail.com");
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });

    expect(getSearchRequests()).toHaveLength(1);
  });
});

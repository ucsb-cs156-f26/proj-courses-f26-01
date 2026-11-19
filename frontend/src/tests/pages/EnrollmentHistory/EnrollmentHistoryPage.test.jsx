import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import EnrollmentHistoryPage from "main/pages/EnrollmentHistory/EnrollmentHistoryPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

describe("EnrollmentHistoryPage tests", () => {
  test("renders the page heading and placeholder", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <EnrollmentHistoryPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole("heading", { name: "Enrollment History" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Search controls and enrollment history graphs/),
    ).toBeInTheDocument();

    axiosMock.restore();
  });
});

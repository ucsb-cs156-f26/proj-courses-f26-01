import { expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { personalSectionsFixtures } from "fixtures/personalSectionsFixtures";

import CourseDetailsTable from "main/components/CourseDetails/CourseDetailsTable";
import { getColumns } from "main/utils/CourseDetailsTable";

const mockedNavigate = vi.fn();

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: () => mockedNavigate,
}));

const mockedMutate = vi.fn();

vi.mock("main/utils/useBackend", async () => ({
  ...(await vi.importActual("main/utils/useBackend")),
  useBackendMutation: () => ({ mutate: mockedMutate }),
}));

describe("CourseDetailsTable tests", () => {
  const queryClient = new QueryClient();

  const testId = "CourseDetailsTable";

  const sectionWith = ({ quarter = "20233", session = null } = {}) => ({
    ...personalSectionsFixtures.threeSummerPersonalSections[0],
    quarter: quarter,
    classSections: [
      {
        ...personalSectionsFixtures.threeSummerPersonalSections[0]
          .classSections[0],
        session,
      },
    ],
  });

  test("renders without crashing for empty table", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CourseDetailsTable details={[]} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  });

  test("Has the expected column headers and content", () => {
    // console.log(oneSection)
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CourseDetailsTable
            details={personalSectionsFixtures.threePersonalSections}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "Course ID",
      "Enroll Code",
      "Section",
      "Title",
      "Enrolled",
      "Location",
      "Days",
      "Time",
      "Instructor",
    ];
    const expectedFields = [
      "courseId",
      "enrollCode",
      "section",
      "title",
      "enrolled",
      "location",
    ];

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-courseId`),
    ).toHaveTextContent("ECE 1A");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-enrollCode`),
    ).toHaveTextContent("12583");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-section`),
    ).toHaveTextContent("0100");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-title`),
    ).toHaveTextContent("COMP ENGR SEMINAR");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-location`),
    ).toHaveTextContent("BUCHN 1930");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-instructor`),
    ).toHaveTextContent("WANG L C");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-days`),
    ).toHaveTextContent("M");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-time`),
    ).toHaveTextContent("3:00 PM - 3:50 PM");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-enrolled`),
    ).toHaveTextContent("84/100");
    expect(
      screen.queryByTestId(`${testId}-header-session`),
    ).not.toBeInTheDocument();
  });

  test("renders session column after Instructor when requested", () => {
    const testid = "CourseDetailsTable";
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CourseDetailsTable
            details={personalSectionsFixtures.threeSummerPersonalSections}
            showSession
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const headerRow = screen.getByTestId(`${testid}-header-group-0`);
    const headers = within(headerRow)
      .getAllByRole("columnheader")
      .map((header) => header.textContent);

    expect(headers.slice(-2)).toEqual(["Instructor", "Session"]);
  });

  test("renders summer session A and B from sixth character", () => {
    const testid = "CourseDetailsTable";
    const sections = [
      sectionWith({ session: "00000A  " }),
      sectionWith({ session: "00000B  " }),
    ];

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CourseDetailsTable details={sections} showSession />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByTestId(`${testid}-cell-row-0-col-session`),
    ).toHaveTextContent("A");
    expect(
      screen.getByTestId(`${testid}-cell-row-1-col-session`),
    ).toHaveTextContent("B");
  });

  test("renders blank session for non-summer or missing session", () => {
    const testid = "CourseDetailsTable";
    const sections = [
      sectionWith({ quarter: "20231", session: "00000A  " }),
      sectionWith({ session: null }),
      sectionWith({ session: "" }),
      sectionWith({ session: "0000" }),
    ];

    render(
      <CourseDetailsTable
        details={sections}
        testid={testid}
        showSession={true}
      />,
    );

    sections.forEach((_section, index) => {
      expect(
        screen.getByTestId(`${testid}-cell-row-${index}-col-session`)
          .textContent,
      ).toBe("");
    });
  });

  test("renders blank session when section is missing or null", async () => {
    vi.resetModules();
    vi.doMock("main/components/OurTable", () => ({
      default: ({ data, columns, testid }) => {
        const sessionColumn = columns.find(
          (column) => column.accessorKey === "session",
        );
        return (
          <table data-testid={testid}>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td data-testid={`${testid}-cell-row-${index}-col-session`}>
                    {sessionColumn.cell({ row: { original: row } })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      },
    }));

    const { default: CourseDetailsTableWithMockedOurTable } =
      await import("main/components/CourseDetails/CourseDetailsTable");
    const testid = "CourseDetailsTable";
    const sections = [
      {
        ...personalSectionsFixtures.threeSummerPersonalSections[0],
        classSections: [], // no sections
      },
      {
        ...personalSectionsFixtures.threeSummerPersonalSections[0],
        classSections: null, // dangerous null!
      },
    ];

    expect(() =>
      render(
        <CourseDetailsTableWithMockedOurTable
          details={sections}
          showSession={true}
        />,
      ),
    ).not.toThrow();

    sections.forEach((_section, index) => {
      expect(
        screen.getByTestId(`${testid}-cell-row-${index}-col-session`)
          .textContent,
      ).toBe("");
    });
  });

  test("Has the expected content when days is empty", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CourseDetailsTable details={personalSectionsFixtures.emptyDays} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-days`),
    ).toHaveTextContent("");
  });

  test("columns contain session column only when requested", async () => {
    const columnsWithSession = getColumns(true);
    const sessionObj = columnsWithSession.filter((obj) => {
      return obj.id === "session";
    })?.[0];

    expect(sessionObj).not.toBe(undefined);
    expect(sessionObj?.id).toBe("session");

    const columnsWithoutSession = getColumns(false);
    const noSessionArray = columnsWithoutSession.filter((obj) => {
      return obj.id === "session";
    });

    expect(noSessionArray.length).toBe(0);

    const columnsWithoutSessionByDefaultArg = getColumns();
    const noSessionArrayByDefaultArg = columnsWithoutSessionByDefaultArg.filter(
      (obj) => {
        return obj.id === "session";
      },
    );

    expect(noSessionArrayByDefaultArg.length).toBe(0);
  });

  test('session cells return "" instead of null for bad inputs', async () => {
    const mockData = personalSectionsFixtures.singleSection;
    const columnsFunctions = getColumns(true);
    const sessionCell = columnsFunctions.filter((obj) => {
      return obj.id === "session";
    })?.[0]?.cell;

    expect(sessionCell).not.toBe(undefined);

    const result = sessionCell({ row: mockData });
    expect(result).toBe("");
  });

  test('days cells return "" instead of null for bad inputs', async () => {
    const mockData = personalSectionsFixtures.emptyDays;
    const columnsFunctions = getColumns();
    const daysCell = columnsFunctions.filter((obj) => {
      return obj.id === "days";
    })?.[0]?.cell;

    const result = daysCell({ row: mockData });
    expect(result).toBe("");
  });
});

import React from "react";
import { render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import GEAreaCoursesTable from "main/components/GEAreas/GEAreaCoursesTable";

const queryClient = new QueryClient();

describe("GEAreaCoursesTable tests", () => {
  const WrappedTable = ({ courses }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <GEAreaCoursesTable courses={courses} />
      </MemoryRouter>
    </QueryClientProvider>
  );

  test("renders the expected table headers and course cells", () => {
    const courses = [
      {
        quarter: "20232",
        courseId: "MATH 1A",
        title: "Calculus I",
        description: "Intro to calculus",
        generalEducation: ["A1", "B"],
      },
      {
        quarter: "20233",
        courseId: "CHEM 2B",
        title: "General Chemistry",
        description: "Chemistry fundamentals",
        generalEducation: [{ geCode: "C1" }, null],
      },
    ];

    render(<WrappedTable courses={courses} />);

    expect(
      screen.getByTestId("GEAreaCoursesTable-header-quarter"),
    ).toHaveTextContent("Quarter");
    expect(
      screen.queryByTestId("GEAreaCoursesTable-header-session"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByTestId("GEAreaCoursesTable-header-courseId"),
    ).toHaveTextContent("Course Id");
    expect(
      screen.getByTestId("GEAreaCoursesTable-header-title"),
    ).toHaveTextContent("Title");
    expect(
      screen.getByTestId("GEAreaCoursesTable-header-description"),
    ).toHaveTextContent("Description");
    expect(
      screen.getByTestId("GEAreaCoursesTable-header-generalEducationAreas"),
    ).toHaveTextContent("General Education Areas");

    expect(
      screen.getByTestId("GEAreaCoursesTable-cell-row-0-col-quarter"),
    ).toHaveTextContent("S23");
    expect(
      screen.getByTestId("GEAreaCoursesTable-cell-row-0-col-courseId"),
    ).toHaveTextContent("MATH 1A");
    expect(
      screen.getByTestId("GEAreaCoursesTable-cell-row-0-col-title"),
    ).toHaveTextContent("Calculus I");
    expect(
      screen.getByTestId("GEAreaCoursesTable-cell-row-0-col-description"),
    ).toHaveTextContent("Intro to calculus");
    expect(
      screen.getByTestId(
        "GEAreaCoursesTable-cell-row-0-col-generalEducationAreas",
      ),
    ).toHaveTextContent(/^A1, B$/);

    expect(
      screen.getByTestId("GEAreaCoursesTable-cell-row-1-col-quarter"),
    ).toHaveTextContent("M23");
    expect(
      screen.getByTestId("GEAreaCoursesTable-cell-row-1-col-courseId"),
    ).toHaveTextContent("CHEM 2B");
    expect(
      screen.getByTestId(
        "GEAreaCoursesTable-cell-row-1-col-generalEducationAreas",
      ),
    ).toHaveTextContent(/^C1$/);
  });

  test("renders session column after Quarter when requested", () => {
    const courses = [
      {
        quarter: "20232",
        courseId: "MATH 1A",
        title: "Calculus I",
        description: "Intro to calculus",
        generalEducation: ["A1", "B"],
      },
      {
        quarter: "20233",
        courseId: "CHEM 2B",
        title: "General Chemistry",
        description: "Chemistry fundamentals",
        generalEducation: [{ geCode: "C1" }, null],
      },
    ];

    render(<GEAreaCoursesTable courses={courses} showSession={true} />);

    expect(
      screen.getByTestId("GEAreaCoursesTable-header-quarter"),
    ).toHaveTextContent("Quarter");
    expect(
      screen.getByTestId("GEAreaCoursesTable-header-session"),
    ).toHaveTextContent("Session");
    expect(
      screen.getByTestId("GEAreaCoursesTable-header-courseId"),
    ).toHaveTextContent("Course Id");
    expect(
      screen.getByTestId("GEAreaCoursesTable-header-title"),
    ).toHaveTextContent("Title");
    expect(
      screen.getByTestId("GEAreaCoursesTable-header-description"),
    ).toHaveTextContent("Description");
    expect(
      screen.getByTestId("GEAreaCoursesTable-header-generalEducationAreas"),
    ).toHaveTextContent("General Education Areas");

    const testid = "GEAreaCoursesTable";
    const headerRow = screen.getByTestId(`${testid}-header-group-0`);
    const headers = within(headerRow)
      .getAllByRole("columnheader")
      .map((header) => header.textContent);

    expect(headers.slice(0, 2)).toEqual(["Quarter", "Session"]);
  });

  test("renders summer session A and B from sixth character", () => {
    const testid = "GEAreaCoursesTable";
    const courses = [
      {
        quarter: "20233",
        session: "00000A  ",
        courseId: "MATH 1A",
        title: "Calculus I",
        description: "Intro to calculus",
        generalEducation: ["A1", "B"],
      },
      {
        quarter: "20233",
        courseId: "CHEM 2B",
        session: "00000B  ",
        title: "General Chemistry",
        description: "Chemistry fundamentals",
        generalEducation: [{ geCode: "C1" }, null],
      },
    ];

    render(<GEAreaCoursesTable courses={courses} showSession={true} />);

    expect(
      screen.getByTestId(`${testid}-cell-row-0-col-session`),
    ).toHaveTextContent("A");
    expect(
      screen.getByTestId(`${testid}-cell-row-1-col-session`),
    ).toHaveTextContent("B");
  });

  test("renders blank session for non-summer or missing session", () => {
    const testid = "GEAreaCoursesTable";
    const courses = [
      // non-summer quarter
      {
        quarter: "20231",
        session: "00000A  ",
        courseId: "MATH 1A",
        title: "Calculus I",
        description: "Intro to calculus",
        generalEducation: ["A1", "B"],
      },
      // no session specified
      {
        quarter: "20231",
        courseId: "MATH 1A",
        title: "Calculus I",
        description: "Intro to calculus",
        generalEducation: ["A1", "B"],
      },
      // null
      {
        quarter: "20233",
        session: null,
        courseId: "MATH 1A",
        title: "Calculus I",
        description: "Intro to calculus",
        generalEducation: ["A1", "B"],
      },
      // empty string
      {
        quarter: "20233",
        courseId: "CHEM 2B",
        session: "",
        title: "General Chemistry",
        description: "Chemistry fundamentals",
        generalEducation: [{ geCode: "C1" }, null],
      },
      // invalidly formatted string
      {
        quarter: "20233",
        courseId: "CHEM 2B",
        session: "0000",
        title: "General Chemistry",
        description: "Chemistry fundamentals",
        generalEducation: [{ geCode: "C1" }, null],
      },
    ];

    render(<GEAreaCoursesTable courses={courses} showSession={true} />);

    courses.forEach((_section, index) => {
      expect(
        screen.getByTestId(`${testid}-cell-row-${index}-col-session`)
          .textContent,
      ).toBe("");
    });
  });

  test("renders blank session when courseInfo is missing or null", async () => {
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
  });

  test("renders empty and trimmed GE area values correctly", () => {
    const courses = [
      {
        quarter: "20234",
        courseId: "TEST 1",
        title: "Test One",
        description: "Empty areas",
        generalEducation: [],
      },
      {
        quarter: "20235",
        courseId: "TEST 2",
        title: "Test Two",
        description: "Trimmed string and object areas",
        generalEducation: [" A1 ", { geCode: " C1 " }],
      },
    ];

    render(<WrappedTable courses={courses} />);

    expect(
      screen.getByTestId(
        "GEAreaCoursesTable-cell-row-0-col-generalEducationAreas",
      ),
    ).toHaveTextContent(/^$/);
    expect(
      screen.getByTestId(
        "GEAreaCoursesTable-cell-row-1-col-generalEducationAreas",
      ).textContent,
    ).toBe("A1, C1");
  });

  test("renders array-like non-array generalEducation objects as blank", () => {
    const courses = [
      {
        quarter: "20234",
        courseId: "TEST 3",
        title: "Test Three",
        description: "Array-like generalEducation",
        generalEducation: {
          length: 0,
          map: () => ["SHOULD NOT SHOW"],
        },
      },
    ];

    render(<WrappedTable courses={courses} />);

    expect(
      screen.getByTestId(
        "GEAreaCoursesTable-cell-row-0-col-generalEducationAreas",
      ),
    ).toHaveTextContent(/^$/);
  });

  test("renders fallback values for non-array and object general education values", () => {
    const courses = [
      {
        quarter: "20234",
        courseId: "TEST 1",
        title: "Test One",
        description: "Non-array generalEducation",
        generalEducation: "A1",
      },
      {
        quarter: "20235",
        courseId: "TEST 2",
        title: "Test Two",
        description: "Object fallback generalEducation",
        generalEducation: [
          {
            toString: () => "CUSTOM",
          },
        ],
      },
    ];

    render(<WrappedTable courses={courses} />);

    expect(
      screen.getByTestId(
        "GEAreaCoursesTable-cell-row-0-col-generalEducationAreas",
      ),
    ).toHaveTextContent(/^$/);
    expect(
      screen.getByTestId(
        "GEAreaCoursesTable-cell-row-1-col-generalEducationAreas",
      ),
    ).toHaveTextContent(/^CUSTOM$/);
  });
});

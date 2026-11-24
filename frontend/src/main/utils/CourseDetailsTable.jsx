import {
  convertToFraction,
  formatInstructors,
  formatLocation,
  formatTime,
  formatSession,
} from "main/utils/sectionUtils.jsx";

export function getColumns(showSession = false) {
  const cols = [
    {
      header: "Course ID",
      accessorKey: "courseId",
      id: "courseId",
    },
    {
      header: "Enroll Code",
      id: "enrollCode",
      cell: ({ cell }) => cell.row.original.classSections[0].enrollCode,
    },
    {
      header: "Section",
      id: "section",
      cell: ({ cell }) => cell.row.original.classSections[0].section,
    },
    {
      header: "Title",
      accessorKey: "title",
      id: "title",
    },
    {
      header: "Enrolled",
      cell: ({ cell }) =>
        convertToFraction(
          cell.row.original.classSections[0].enrolledTotal,
          cell.row.original.classSections[0].maxEnroll,
        ),
      id: "enrolled",
    },
    {
      header: "Location",
      cell: ({ cell }) =>
        formatLocation(cell.row.original.classSections[0].timeLocations),
      id: "location",
    },
    {
      header: "Days",
      cell: ({ cell }) => {
        try {
          const result =
            cell.row.original.classSections[0].timeLocations[0].days;
          return result;
        } catch {
          return "";
        }
      },
      id: "days",
    },
    {
      header: "Time",
      cell: ({ cell }) =>
        formatTime(cell.row.original.classSections[0].timeLocations),
      id: "time",
    },
    {
      header: "Instructor",
      cell: ({ cell }) =>
        formatInstructors(cell.row.original.classSections[0].instructors),
      id: "instructor",
    },
  ];

  if (showSession) {
    cols.push({
      header: "Session",
      accessorKey: "session",
      cell: ({ row }) => {
        try {
          const result = formatSession(
            row.original.quarter,
            row.original.classSections[0].session,
          );
          return result;
        } catch {
          return "";
        }
      },
      id: "session",
    });
  }

  return cols;
}

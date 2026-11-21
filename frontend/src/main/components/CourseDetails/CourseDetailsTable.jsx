import React from "react";
import OurTable from "main/components/OurTable";
import { getColumns } from "main/utils/CourseDetailsTable";

export default function CourseDetailsTable({ details, showSession = false }) {
  const testid = "CourseDetailsTable";

  const columnsToDisplay = getColumns(showSession);

  return <OurTable data={details} columns={columnsToDisplay} testid={testid} />;
}

import React from "react";
import primaryFixtures from "fixtures/primaryFixtures";
import GEAreaCoursesTable from "main/components/GEAreas/GEAreaCoursesTable";

export default {
  title: "components/GEAreas/GEAreaCoursesTable",
  component: GEAreaCoursesTable,
};

// “template” function for args
const Template = (args) => <GEAreaCoursesTable {...args} />;

export const Default = Template.bind({});
Default.args = {
  courses: primaryFixtures.f24_math_lowerDiv,
};

export const SummerCourse = Template.bind({});
SummerCourse.args = {
  courses: primaryFixtures.singleSummerCourse,
  showSession: true,
};

import React from "react";

import ConvertedSectionTable from "main/components/Common/ConvertedSectionTable";
import { oneSection, threeSections } from "fixtures/sectionFixtures";

export default {
  title: "components/Common/ConvertedSectionTable",
  component: ConvertedSectionTable,
};

const Template = (args) => {
  return <ConvertedSectionTable {...args} />;
};

const sectionWith = ({ quarter = "20233", session = null } = {}) => ({
  ...oneSection[0],
  courseInfo: {
    ...oneSection[0].courseInfo,
    quarter,
  },
  section: {
    ...oneSection[0].section,
    session,
  },
});

const sectionWithoutSession = ({ quarter = "20233" } = {}) => {
  const { session: _session, ...section } = oneSection[0].section;
  return {
    ...oneSection[0],
    courseInfo: {
      ...oneSection[0].courseInfo,
      quarter,
    },
    section,
  };
};

export const Empty = Template.bind({});
Empty.args = {
  sections: [],
};

export const ThreeCourses = Template.bind({});
ThreeCourses.args = {
  sections: threeSections,
};

export const SummerCourses = Template.bind({});
SummerCourses.args = {
  sections: [
    sectionWith({ session: "00000A   " }),
    sectionWith({ session: "00000B   " }),
    sectionWith({ session: "00000C   " }),
    sectionWith({ session: "00000D   " }),
    sectionWith({ session: "00000E   " }),
    sectionWith({ session: "00000F   " }),
    sectionWith({ session: "00000G   " }),
    sectionWithoutSession(),
  ],
  showSession: true,
};

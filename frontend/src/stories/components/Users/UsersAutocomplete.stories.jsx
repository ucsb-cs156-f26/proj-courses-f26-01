import UsersAutocomplete from "main/components/Users/UsersAutocomplete";
import usersFixtures from "fixtures/usersFixtures";

export default {
  title: "components/Users/UsersAutocomplete",
  component: UsersAutocomplete,
};

const Template = (args) => {
  return <UsersAutocomplete {...args} />;
};

export const Empty = Template.bind({});
Empty.args = {
  users: [],
};

export const ThreeUsers = Template.bind({});
ThreeUsers.args = {
  users: usersFixtures.threeUsers,
};

export const OneUser = Template.bind({});
OneUser.args = {
  users: [usersFixtures.threeUsers[0]],
};

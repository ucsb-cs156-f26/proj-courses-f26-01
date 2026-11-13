package edu.ucsb.cs156.courses.controllers;

// Tests for UsersController, including paged endpoints with sortField support

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.courses.ControllerTestCase;
import edu.ucsb.cs156.courses.entities.User;
import edu.ucsb.cs156.courses.repositories.UserRepository;
import edu.ucsb.cs156.courses.testconfig.TestConfig;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = UsersController.class)
@Import(TestConfig.class)
public class UsersControllerTests extends ControllerTestCase {

  @MockBean UserRepository userRepository;

  @Autowired private ObjectMapper objectMapper;

  PageRequest pageRequest_0_5_ASC = PageRequest.of(0, 5, Direction.ASC, "email");
  PageRequest pageRequest_0_5_DESC = PageRequest.of(0, 5, Direction.DESC, "email");

  @Test
  public void users__logged_out() throws Exception {
    mockMvc.perform(get("/api/admin/users")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void users__user_logged_in() throws Exception {
    mockMvc.perform(get("/api/admin/users")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void users__admin_logged_in() throws Exception {

    // arrange

    User u1 = User.builder().id(1L).build();
    User u2 = User.builder().id(2L).build();
    User u = currentUserService.getCurrentUser().getUser();

    ArrayList<User> expectedUsers = new ArrayList<>();
    expectedUsers.addAll(Arrays.asList(u1, u2, u));

    when(userRepository.findAll()).thenReturn(expectedUsers);
    String expectedJson = mapper.writeValueAsString(expectedUsers);

    // act

    MvcResult response =
        mockMvc.perform(get("/api/admin/users")).andExpect(status().isOk()).andReturn();

    // assert

    verify(userRepository, times(1)).findAll();
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void usersPaged__admin_logged_in_asc() throws Exception {
    // arrange

    User u1 = User.builder().id(1L).build();
    User u2 = User.builder().id(2L).build();
    User u = currentUserService.getCurrentUser().getUser();

    ArrayList<User> expectedUsers = new ArrayList<>();
    expectedUsers.addAll(Arrays.asList(u1, u2, u));

    Page<User> testPage_0_5_ASC = new PageImpl<User>(expectedUsers, pageRequest_0_5_ASC, 3);

    when(userRepository.findAll(pageRequest_0_5_ASC)).thenReturn(testPage_0_5_ASC);
    String expectedJson = objectMapper.writeValueAsString(testPage_0_5_ASC);

    // act

    MvcResult response =
        mockMvc
            .perform(
                get("/api/admin/users")
                    .param("page", "0")
                    .param("pageSize", "5")
                    .param("sortField", "email")
                    .param("sortDirection", "ASC"))
            .andExpect(status().isOk())
            .andReturn();

    // assert

    verify(userRepository, times(1))
        .findAll(
            org.springframework.data.domain.PageRequest.of(
                0, 5, org.springframework.data.domain.Sort.Direction.ASC, "email"));
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void usersPaged__admin_logged_in_desc() throws Exception {
    // arrange

    User u1 = User.builder().id(1L).build();
    User u2 = User.builder().id(2L).build();
    User u = currentUserService.getCurrentUser().getUser();

    ArrayList<User> expectedUsers = new ArrayList<>();
    expectedUsers.addAll(Arrays.asList(u1, u2, u));

    Page<User> testPage_0_5_DESC = new PageImpl<User>(expectedUsers, pageRequest_0_5_DESC, 3);

    when(userRepository.findAll(pageRequest_0_5_DESC)).thenReturn(testPage_0_5_DESC);
    String expectedJson = objectMapper.writeValueAsString(testPage_0_5_DESC);
    // act

    MvcResult response =
        mockMvc
            .perform(
                get("/api/admin/users")
                    .param("page", "0")
                    .param("pageSize", "5")
                    .param("sortField", "email")
                    .param("sortDirection", "DESC"))
            .andExpect(status().isOk())
            .andReturn();

    // assert

    verify(userRepository, times(1))
        .findAll(
            org.springframework.data.domain.PageRequest.of(
                0, 5, org.springframework.data.domain.Sort.Direction.DESC, "email"));
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void usersPaged__fails_when_invalid_sortField() throws Exception {

    MvcResult response =
        mockMvc
            .perform(
                get("/api/admin/users")
                    .param("page", "0")
                    .param("pageSize", "5")
                    .param("sortField", "INVALID")
                    .param("sortDirection", "ASC"))
            .andExpect(status().isBadRequest())
            .andReturn();

    Map<String, String> expectedResponse =
        Map.of(
            "message",
            "INVALID is not a valid sort field.  Valid values are [givenName, familyName, email]",
            "type",
            "IllegalArgumentException");

    // assert

    String expectedResponseAsJson = objectMapper.writeValueAsString(expectedResponse);
    String actualResponse = response.getResponse().getContentAsString();
    assertEquals(expectedResponseAsJson, actualResponse);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void usersPaged__fails_when_invalid_sortDirection() throws Exception {

    MvcResult response =
        mockMvc
            .perform(
                get("/api/admin/users")
                    .param("page", "0")
                    .param("pageSize", "5")
                    .param("sortField", "email")
                    .param("sortDirection", "INVALID"))
            .andExpect(status().isBadRequest())
            .andReturn();

    Map<String, String> expectedResponse =
        Map.of(
            "message",
            "INVALID is not a valid sort direction.  Valid values are [ASC, DESC]",
            "type",
            "IllegalArgumentException");

    // assert

    String expectedResponseAsJson = objectMapper.writeValueAsString(expectedResponse);
    String actualResponse = response.getResponse().getContentAsString();
    assertEquals(expectedResponseAsJson, actualResponse);
  }

  @Test
  public void searchUsers__logged_out() throws Exception {
    mockMvc
        .perform(get("/api/admin/users/search").param("query", "alice"))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void searchUsers__regular_user() throws Exception {
    mockMvc
        .perform(get("/api/admin/users/search").param("query", "alice"))
        .andExpect(status().isForbidden());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void searchUsers__admin_success() throws Exception {
    User u1 = User.builder().id(1L).fullName("Alice Smith").email("alice@ucsb.edu").build();

    User u2 = User.builder().id(2L).fullName("Alicia Jones").email("alicia@ucsb.edu").build();

    List<User> expectedUsers = Arrays.asList(u1, u2);
    PageRequest pageRequest = PageRequest.of(0, 10, Direction.ASC, "fullName");

    when(userRepository.searchUsers("ali", pageRequest)).thenReturn(expectedUsers);

    MvcResult response =
        mockMvc
            .perform(get("/api/admin/users/search").param("query", "ali"))
            .andExpect(status().isOk())
            .andReturn();

    assertEquals(
        objectMapper.writeValueAsString(expectedUsers),
        response.getResponse().getContentAsString());

    verify(userRepository, times(1)).searchUsers("ali", pageRequest);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void searchUsers__trims_whitespace() throws Exception {
    PageRequest pageRequest = PageRequest.of(0, 10, Direction.ASC, "fullName");

    when(userRepository.searchUsers("alice", pageRequest)).thenReturn(List.of());

    mockMvc
        .perform(get("/api/admin/users/search").param("query", "  alice  "))
        .andExpect(status().isOk())
        .andExpect(content().json("[]"));

    verify(userRepository, times(1)).searchUsers("alice", pageRequest);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void searchUsers__short_queries() throws Exception {
    mockMvc
        .perform(get("/api/admin/users/search").param("query", "a"))
        .andExpect(status().isOk())
        .andExpect(content().json("[]"));

    mockMvc
        .perform(get("/api/admin/users/search").param("query", "  "))
        .andExpect(status().isOk())
        .andExpect(content().json("[]"));

    mockMvc
        .perform(get("/api/admin/users/search").param("query", ""))
        .andExpect(status().isOk())
        .andExpect(content().json("[]"));

    verifyNoInteractions(userRepository);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void searchUsers__two_character_query() throws Exception {
    PageRequest pageRequest = PageRequest.of(0, 10, Direction.ASC, "fullName");

    when(userRepository.searchUsers("al", pageRequest)).thenReturn(List.of());

    mockMvc
        .perform(get("/api/admin/users/search").param("query", "al"))
        .andExpect(status().isOk())
        .andExpect(content().json("[]"));

    verify(userRepository, times(1)).searchUsers("al", pageRequest);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void searchUsers__limits_to_ten() throws Exception {
    List<User> users = new ArrayList<>();

    for (int i = 0; i < 10; i++) {
      users.add(User.builder().id(i + 1L).fullName("Test User " + i).build());
    }

    PageRequest pageRequest = PageRequest.of(0, 10, Direction.ASC, "fullName");

    when(userRepository.searchUsers("test", pageRequest)).thenReturn(users);

    MvcResult response =
        mockMvc
            .perform(get("/api/admin/users/search").param("query", "test"))
            .andExpect(status().isOk())
            .andReturn();

    User[] result =
        objectMapper.readValue(response.getResponse().getContentAsString(), User[].class);

    assertEquals(10, result.length);
    verify(userRepository, times(1)).searchUsers("test", pageRequest);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void searchUsers__missing_query() throws Exception {
    mockMvc.perform(get("/api/admin/users/search")).andExpect(status().isBadRequest());

    verifyNoInteractions(userRepository);
  }
}

package edu.ucsb.cs156.courses.repositories;

import static org.junit.jupiter.api.Assertions.assertEquals;

import edu.ucsb.cs156.courses.entities.User;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@DataJpaTest(
    properties = {"spring.liquibase.enabled=false", "spring.jpa.hibernate.ddl-auto=create-drop"})
public class UserRepositoryTests {

  @Autowired private UserRepository userRepository;

  private void addUser(String fullName, String givenName, String familyName, String email) {

    User user =
        User.builder()
            .fullName(fullName)
            .givenName(givenName)
            .familyName(familyName)
            .email(email)
            .build();

    userRepository.save(user);
  }

  private List<User> search(String query) {
    PageRequest pageRequest = PageRequest.of(0, 10, Sort.by("fullName"));

    return userRepository.searchUsers(query, pageRequest);
  }

  @Test
  public void searchUsers__full_name() {
    addUser("Alice Smith", "Alice", "Smith", "alice@ucsb.edu");
    addUser("Bob Jones", "Bob", "Jones", "bob@ucsb.edu");

    List<User> results = search("Alice Smith");

    assertEquals(1, results.size());
    assertEquals("alice@ucsb.edu", results.get(0).getEmail());
  }

  @Test
  public void searchUsers__given_name_case_insensitive() {
    addUser("Alice Smith", "Alice", "Smith", "alice@ucsb.edu");
    addUser("Bob Jones", "Bob", "Jones", "bob@ucsb.edu");

    List<User> results = search("aLI");

    assertEquals(1, results.size());
    assertEquals("Alice Smith", results.get(0).getFullName());
  }

  @Test
  public void searchUsers__family_name() {
    addUser("Alice Smith", "Alice", "Smith", "alice@ucsb.edu");
    addUser("Bob Jones", "Bob", "Jones", "bob@ucsb.edu");

    List<User> results = search("JON");

    assertEquals(1, results.size());
    assertEquals("Bob Jones", results.get(0).getFullName());
  }

  @Test
  public void searchUsers__email() {
    addUser("Alice Smith", "Alice", "Smith", "alice@ucsb.edu");
    addUser("Bob Jones", "Bob", "Jones", "bob@example.org");

    List<User> results = search("UCSB.EDU");

    assertEquals(1, results.size());
    assertEquals("alice@ucsb.edu", results.get(0).getEmail());
  }

  @Test
  public void searchUsers__no_matches() {
    addUser("Alice Smith", "Alice", "Smith", "alice@ucsb.edu");

    List<User> results = search("charlie");

    assertEquals(0, results.size());
  }

  @Test
  public void searchUsers__partial_match() {
    addUser("Alice Smith", "Alice", "Smith", "alice@ucsb.edu");

    List<User> results = search("lic");

    assertEquals(1, results.size());
    assertEquals("Alice Smith", results.get(0).getFullName());
  }

  @Test
  public void searchUsers__limit_and_sort() {
    for (int i = 0; i < 12; i++) {
      addUser(String.format("Test User %02d", i), "Test", "User", "test" + i + "@ucsb.edu");
    }

    List<User> results = search("test");

    assertEquals(10, results.size());
    assertEquals("Test User 00", results.get(0).getFullName());
    assertEquals("Test User 09", results.get(9).getFullName());
  }
}

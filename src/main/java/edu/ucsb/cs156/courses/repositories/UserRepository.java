package edu.ucsb.cs156.courses.repositories;

import edu.ucsb.cs156.courses.entities.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends CrudRepository<User, Long> {
  Optional<User> findByEmail(String email);

  Page<User> findAll(Pageable pageable);

  @Query(
      """
      SELECT u FROM users u
      WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%'))
         OR LOWER(u.givenName) LIKE LOWER(CONCAT('%', :query, '%'))
         OR LOWER(u.familyName) LIKE LOWER(CONCAT('%', :query, '%'))
         OR LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))
      """)
  List<User> searchUsers(@Param("query") String query, Pageable pageable);
}

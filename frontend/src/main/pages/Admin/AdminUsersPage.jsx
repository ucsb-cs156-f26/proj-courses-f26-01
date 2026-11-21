import React, { useEffect, useState } from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UsersTable from "main/components/Users/UsersTable";
import UsersSearchForm from "main/components/Users/UsersSearchForm";
import UsersAutocomplete from "main/components/Users/UsersAutocomplete";
import axios from "axios";

import { useBackend } from "main/utils/useBackend";
import OurPagination from "main/components/Utils/OurPagination";
import useLocalStorage from "main/utils/useLocalStorage";

const AdminUsersPage = () => {
  const [selectedPage, setSelectedPage] = useState(1);
  const [pageSize, setPageSize] = useLocalStorage("UsersSearch.PageSize", "10");
  const [sortField, setSortField] = useLocalStorage(
    "UsersSearch.SortField",
    "email",
  );
  const [sortDirection, setSortDirection] = useLocalStorage(
    "UsersSearch.SortDirection",
    "ASC",
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchError, setSearchError] = useState(false);

  const {
    data: page,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/admin/users", selectedPage, pageSize, sortField, sortDirection],
    {
      // Stryker disable next-line StringLiteral : GET is default, so replacing with "" is an equivalent mutation
      method: "GET",
      url: "/api/admin/users",
      params: {
        page: selectedPage - 1,
        pageSize,
        sortField,
        sortDirection,
      },
    },
    { content: [], totalPages: 0 },
  );

  useEffect(() => {
    const query = searchTerm.trim();

    if (query.length < 2 || selectedUser) {
      return undefined;
    }

    let active = true;

    const timeoutId = setTimeout(async () => {
      try {
        const response = await axios.get("/api/admin/users/search", {
          params: { query },
        });

        if (active) {
          setSearchResults(response.data);
          setSearchError(false);
        }
      } catch {
        if (active) {
          setSearchResults(null);
          setSearchError(true);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [searchTerm, selectedUser]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setSelectedUser(null);
    setSearchResults(null);
    setSearchError(false);
  };

  const handleSelect = (user) => {
    setSelectedUser(user);
  };

  const displayedUsers = selectedUser ? [selectedUser] : page.content;

  return (
    <BasicLayout>
      <h2>Users</h2>

      <UsersAutocomplete
        users={searchResults}
        onSearch={handleSearch}
        onSelect={handleSelect}
      />

      {searchError && (
        <div role="alert" className="text-danger mt-2">
          Unable to search users. Please try again.
        </div>
      )}

      <div className="mt-3">
        <UsersSearchForm
          updateSortField={setSortField}
          updateSortDirection={setSortDirection}
          updatePageSize={setPageSize}
        />
      </div>

      {!selectedUser && (
        <OurPagination
          updateActivePage={setSelectedPage}
          totalPages={page.totalPages}
        />
      )}

      <UsersTable users={displayedUsers} />
    </BasicLayout>
  );
};

export default AdminUsersPage;

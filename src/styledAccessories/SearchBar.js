import React, { useEffect, useRef, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import searchIcon from "./../assets/svg/search.svg";

function SearchBar() {
  const [openSearch, setOpenSearch] = useState(false);
  const closeSearchField = () => {
    setOpenSearch(false);
  };
  const openSearchField = () => {
    setOpenSearch(true);
  };
  return (
    <span>
      {!openSearch ? (
        <IconButton onClick={openSearchField}>
          {/* <SearchIcon fontSize='large' className='bg-white rounded-full'/> */}
          <img src={searchIcon} alt="" />
        </IconButton>
      ) : (
        <SearchField closeSearchField={closeSearchField} />
      )}
    </span>
  );
}

function SearchField({ closeSearchField }) {
  const ref = useRef(null);
  useEffect(() => {
    const handleOutSideClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        closeSearchField();
      }
    };
    document.addEventListener("click", handleOutSideClick, true);
    return () => {
      document.removeEventListener("click", handleOutSideClick, true);
    };
  });
  return (
    <TextField
      ref={ref}
      InputProps={{
        startAdornment: (
          <InputAdornment className="mr-2">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: (
          <CloseIcon
            style={{
              fontSize: "12px",
            }}
          />
        ),
        sx: {
          fontFamily: "Lato",
        },
        inputProps: {
          style: {
            padding: "8px",
          },
        },
      }}
      className="bg-white p-0"
      sx={{
        fontFamily: "Lato",
      }}
    ></TextField>
  );
}

export default SearchBar;

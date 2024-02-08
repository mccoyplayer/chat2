import { Box, styled } from "@mui/system";
import React from "react";
const GrowDiv = styled(Box)({
  flexGrow: 1,
});
function Gap() {
  return <GrowDiv />;
}

export default Gap;

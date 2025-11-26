"use client";

import { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import MobileDateRangeCalendar from "@/components/MobileDateRangeCalendar/MobileDateRangeCalendar";
import type { DateRange } from "@/components/MobileDateRangeCalendar/types";

export default function HomePage() {
  const [range, setRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  const formatDate = (d: Date | null) => (d ? d.toLocaleDateString() : "—");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* верхний блок с инфой и выбранным диапазоном */}
      <Box
        sx={{
          px: 2,
          pt: 2,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Choose your stay
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Custom mobile date range picker
        </Typography>

        <Paper
          sx={{
            mt: 2,
            px: 2,
            py: 1.5,
            borderRadius: 999,
            width: "100%",
            maxWidth: 600,
            mx: "auto",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle2">Selected range</Typography>

          <Typography variant="body1">
            {formatDate(range.startDate)} — {formatDate(range.endDate)}
          </Typography>
        </Paper>
      </Box>

      {/* сам календарь */}
      <Box sx={{ flex: 1, p: 2 }}>
        <Paper
          sx={{
            width: "100%",
            maxWidth: 600,
            mx: "auto",
            height: "min(600px, calc(100vh - 170px))",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <MobileDateRangeCalendar
            initialMonth={new Date()}
            monthsBefore={0}
            monthsAfter={6}
            onChange={setRange}
          />
        </Paper>
      </Box>
    </Box>
  );
}

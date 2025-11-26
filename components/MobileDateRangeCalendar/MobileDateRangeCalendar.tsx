"use client";

import {
  Box,
  Typography,
  IconButton,
  ButtonBase,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

import {
  addMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isBefore,
  isAfter,
  format,
} from "date-fns";
import { enUS } from "date-fns/locale";

import { useMemo, useRef, useState, useEffect, TouchEvent } from "react";

import type { DateRange, MobileDateRangeCalendarProps } from "./types";

const WEEK_DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function generateMonths(baseMonth: Date, before: number, after: number) {
  const res: Date[] = [];
  for (let i = -before; i <= after; i++) {
    res.push(addMonths(baseMonth, i));
  }
  return res;
}

function isBetween(date: Date, start: Date, end: Date) {
  return (
    (isAfter(date, start) || isSameDay(date, start)) &&
    (isBefore(date, end) || isSameDay(date, end))
  );
}

const TAP_MOVE_THRESHOLD = 8;

export default function MobileDateRangeCalendar({
  initialMonth = new Date(),
  monthsBefore = 0,
  monthsAfter = 6,
  onChange,
}: MobileDateRangeCalendarProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  const baseMonth = useMemo(() => startOfMonth(initialMonth), [initialMonth]);

  const months = useMemo(
    () => generateMonths(baseMonth, monthsBefore, monthsAfter),
    [baseMonth, monthsBefore, monthsAfter]
  );

  const [currentMonthHeader, setCurrentMonthHeader] = useState(baseMonth);
  const [range, setRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const touchRef = useRef<{ startY: number; isScroll: boolean } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const monthRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const setMonthRef = (iso: string) => (el: HTMLDivElement | null) => {
    if (el) monthRefs.current.set(iso, el);
    else monthRefs.current.delete(iso);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
            const iso = entry.target.getAttribute("data-month");
            if (iso) setCurrentMonthHeader(startOfMonth(new Date(iso)));
          }
        });
      },
      {
        root: containerRef.current,
        threshold: [0.5, 0.7, 0.9],
      }
    );

    monthRefs.current.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [months]);

  const handleDaySelect = (day: Date) => {
    if (touchRef.current?.isScroll) return;

    const { startDate, endDate } = range;

    let next: DateRange;
    if (!startDate || endDate) {
      next = { startDate: day, endDate: null };
    } else if (isSameDay(day, startDate)) {
      next = { startDate: day, endDate: day };
    } else if (isBefore(day, startDate)) {
      next = { startDate: day, endDate: startDate };
    } else {
      next = { startDate, endDate: day };
    }

    setRange(next);
    onChange?.(next);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    touchRef.current = { startY: t.clientY, isScroll: false };
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!touchRef.current) return;
    const t = e.touches[0];
    const delta = Math.abs(t.clientY - touchRef.current.startY);
    if (delta > TAP_MOVE_THRESHOLD) touchRef.current.isScroll = true;
  };

  const handleTouchEnd = () => {
    requestAnimationFrame(() => {
      touchRef.current = null;
    });
  };

  const scrollToMonth = (index: number) => {
    const iso = months[index].toISOString();
    const el = monthRefs.current.get(iso);
    if (!el || !containerRef.current) return;

    containerRef.current.scrollTo({
      top: el.offsetTop,
      behavior: "smooth",
    });
  };

  const handlePrevClick = () => {
    const idx = months.findIndex((m) => isSameMonth(m, currentMonthHeader));
    if (idx > 0) scrollToMonth(idx - 1);
  };

  const handleNextClick = () => {
    const idx = months.findIndex((m) => isSameMonth(m, currentMonthHeader));
    if (idx < months.length - 1) scrollToMonth(idx + 1);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: 600,
        maxHeight: 600,
        height: "100%",
        mx: "auto",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <IconButton size="small" onClick={handlePrevClick}>
          <ChevronLeft />
        </IconButton>

        <Box sx={{ flex: 1, textAlign: "center" }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {format(currentMonthHeader, "LLLL yyyy", { locale: enUS })}
          </Typography>
        </Box>

        <IconButton size="small" onClick={handleNextClick}>
          <ChevronRight />
        </IconButton>
      </Box>

      {/* SCROLLER */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {months.map((monthDate) => {
          const iso = monthDate.toISOString();
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);
          const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
          const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

          const days = eachDayOfInterval({ start: calStart, end: calEnd });
          const rows = days.length / 7;

          return (
            <Box
              key={iso}
              data-month={iso}
              ref={setMonthRef(iso)}
              sx={{
                scrollSnapAlign: "start",
                height: "100%",
                px: 2,
                py: 2,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* WEEK DAYS */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7,1fr)",
                  mb: 1,
                }}
              >
                {WEEK_DAYS.map((d) => (
                  <Typography
                    key={d}
                    variant="caption"
                    sx={{ textAlign: "center", color: "text.secondary" }}
                  >
                    {d}
                  </Typography>
                ))}
              </Box>

              {/* DAY GRID */}
              <Box
                sx={{
                  flex: 1,
                  display: "grid",
                  gridTemplateColumns: "repeat(7,1fr)",
                  gridTemplateRows: `repeat(${rows}, 1fr)`,
                  gap: 0.5,
                }}
              >
                {days.map((day) => {
                  const { startDate, endDate } = range;

                  const isToday = isSameDay(day, new Date());
                  const isCurrent = isSameMonth(day, monthDate);
                  const isStart = startDate && isSameDay(day, startDate);
                  const isEnd = endDate && isSameDay(day, endDate);

                  const isInRange =
                    startDate &&
                    endDate &&
                    isBetween(day, startDate, endDate) &&
                    !isStart &&
                    !isEnd;

                  return (
                    <ButtonBase
                      key={day.toISOString()}
                      disabled={!isCurrent}
                      onClick={() => handleDaySelect(day)}
                      sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 0,
                        bgcolor:
                          isStart || isEnd
                            ? theme.palette.primary.main
                            : isInRange
                            ? theme.palette.grey[300]
                            : "transparent",
                        color:
                          isStart || isEnd
                            ? "#fff"
                            : isCurrent
                            ? "text.primary"
                            : "text.disabled",
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2">
                        {format(day, "d")}
                      </Typography>

                      {/* TODAY */}
                      {isToday && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: 3,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "45%",
                            height: 3,
                            bgcolor: theme.palette.primary.main,
                            borderRadius: 2,
                            zIndex: 5,
                          }}
                        />
                      )}
                    </ButtonBase>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

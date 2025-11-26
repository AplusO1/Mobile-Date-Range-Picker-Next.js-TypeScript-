export type DateRange = {
  startDate: Date | null;
  endDate: Date | null;
};

export type MobileDateRangeCalendarProps = {
  /** С какого месяца начинать календарь */
  initialMonth?: Date;
  /** Сколько месяцев показывать ДО initialMonth */
  monthsBefore?: number;
  /** Сколько месяцев показывать ПОСЛЕ initialMonth */
  monthsAfter?: number;
  /** Коллбек, когда пользователь изменяет диапазон */
  onChange?: (range: DateRange) => void;
};

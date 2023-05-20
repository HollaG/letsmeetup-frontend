import { fireEvent, getByText, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { addMonths, format } from "date-fns";
import CalendarContainer from "./CalendarContainer";

/**
 * Tests for the Calendar component.
 *
 * Issue: ResizeObserver not defined (mock it):
 * @see https://github.com/maslianok/react-resize-detector/issues/145#issuecomment-953569721
 */

const { ResizeObserver } = window;

beforeEach(() => {
    //@ts-ignore
    delete window.ResizeObserver;
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
    }));
});

afterEach(() => {
    window.ResizeObserver = ResizeObserver;
    jest.restoreAllMocks();
});

test("calendar displays properly", () => {
    const datesSelected: string[] = [];
    const setDatesSelectedMock = jest.fn();
    render(
        <CalendarContainer
            datesSelected={datesSelected}
            setDatesSelected={setDatesSelectedMock}
        />
    );
    // check if the month display displays the correct moment
    const monthDisplay = format(new Date(), "MMM yyyy");
    expect(screen.getByTestId("month-display")).toHaveTextContent(monthDisplay);

    // left arrow disabled when first opening page
    expect(screen.getByLabelText("Previous month")).toBeDisabled();

    // right arrow enabled when first opening page
    expect(screen.getByLabelText("Next month")).toBeEnabled();

    // ensure the select container is there
    expect(screen.getByTestId("select-container-calendar")).toBeInTheDocument();

    const lastDay = screen.getByTestId("last-day");
    expect(
        lastDay.lastElementChild?.lastElementChild?.lastElementChild
    ).toHaveStyle({
        color: "unset",
    });

    fireEvent.click(screen.getByLabelText("Next month"));
    expect(screen.getByTestId("month-display")).toHaveTextContent(
        format(addMonths(new Date(), 1), "MMM yyyy")
    );

    // click 11 more times, should be disabled.
    for (let i = 0; i < 11; i++) {
        fireEvent.click(screen.getByLabelText("Next month"));
    }
    expect(screen.getByLabelText("Next month")).toBeDisabled();
});

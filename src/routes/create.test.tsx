import { getByText, render, screen } from "@testing-library/react";
import Create from "./create";
import "@testing-library/jest-dom/extend-expect";
import { format } from "date-fns";
import CalendarContainer from "../components/Calendar/CalendarContainer";

/**
 * Tests for the create page.
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

test("renders the create page", () => {
    render(<Create />);

    
});

test("calendar displays properly", () => {
    render(<CalendarContainer />);
    // check if the month display displays the correct moment
    const monthDisplay = format(new Date(), "MMM yyyy");
    expect(screen.getByTestId("month-display")).toHaveTextContent(monthDisplay);

    // left arrow disabled when first opening page
    expect(screen.getByLabelText("Previous month")).toBeDisabled();

    // right arrow enabled when first opening page
    expect(screen.getByLabelText("Next month")).toBeEnabled();
})
import { getByText, render, screen } from "@testing-library/react";
import Create from "./create";
import "@testing-library/jest-dom/extend-expect";
import { format } from "date-fns";

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
    const { container }= render(<Create />);

    expect(container.querySelector("#title")).toBeInTheDocument();
    expect(container.querySelector("#title")).toBeRequired();
    expect(container.querySelector("#description")).toBeInTheDocument();

    expect(screen.getByTestId("calendar-component")).toBeInTheDocument();

    expect(screen.getByTestId("timerange-component")).toBeInTheDocument();
});


import { Button } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null; // Don't show if only 1 page

    return (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4 mb-5">
            <Button
                variant="outline-secondary"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="d-flex align-items-center gap-1"
            >
                <FaChevronLeft size={12} /> Previous
            </Button>

            <span className="text-muted small fw-bold">
        Page {currentPage} of {totalPages}
      </span>

            <Button
                variant="outline-secondary"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="d-flex align-items-center gap-1"
            >
                Next <FaChevronRight size={12} />
            </Button>
        </div>
    );
};

export default Pagination;
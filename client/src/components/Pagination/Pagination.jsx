import { Pagination } from "react-bootstrap";

const PaginationComponent = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null; // Don't show if only 1 page

    // Helper to generate the array of page numbers to display
    const getPageNumbers = () => {
        const delta = 2; // How many pages to show on each side of current page
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            // Logic: Always show first, last, and pages around the current one
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        // Add ellipses (...) where there are gaps
        range.forEach((i) => {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push("...");
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    };

    const pages = getPageNumbers();

    return (
        <div className="d-flex justify-content-center mt-4 mb-5">
            <Pagination>
                {/* First & Prev Buttons */}
                <Pagination.First
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                />
                <Pagination.Prev
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                />

                {/* Page Numbers */}
                {pages.map((page, index) => {
                    if (page === "...") {
                        return <Pagination.Ellipsis key={`ellipsis-${index}`} disabled />;
                    }

                    return (
                        <Pagination.Item
                            key={page}
                            active={page === currentPage}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </Pagination.Item>
                    );
                })}

                {/* Next & Last Buttons */}
                <Pagination.Next
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                />
                <Pagination.Last
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                />
            </Pagination>
        </div>
    );
};

export default PaginationComponent;
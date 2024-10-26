import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Response } from 'express';

interface ErrorResponse {
    message: string;
    statusCode: number;
    details?: string;
}

interface SuccessResponse<T> {
    status: string;
    message: string;
    data: T;
}

export interface PaginationMeta {
    currentPage: number;
    totalItems: number;
    totalPages: number;
    pageSize: number;
    nextPage?: number;
    prevPage?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    status: string;
    message: string;
    meta: PaginationMeta;
}

export class PaginationDto {
    @IsNumber()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    limit: number = 10;

    @IsNumber()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    page: number = 1;
}

/**
 * Reusable error handler function for sending consistent error responses.
 * @param res - Express Response object
 * @param error - Error instance or string describing the error
 * @param customMessage - Optional custom message to send in the response
 * @param statusCode - Optional status code (default: 500)
 */
export const errorResponse = (
    res: Response,
    error: unknown,
    customMessage?: string,
    statusCode = 500
): void => {
    const errorResponse: ErrorResponse = {
        message: customMessage || 'An unexpected error occurred',
        statusCode,
    };

    if (error instanceof Error) {
        errorResponse.details = error.message;
        console.error(`Error: ${error.message}`); // Log error for debugging
    } else if (typeof error === 'string') {
        errorResponse.details = error;
        console.error(`Error: ${error}`);
    } else {
        console.error('Unknown error occurred');
    }

    res.status(statusCode).json(errorResponse);
};

/**
 * Success response utility
 * @param res - Express Response object
 * @param data - Data to send in the response
 * @param message - Success message
 */
export const successResponse = <T>(res: Response, data: T, message = 'Request successful', statusCode = 200): void => {
    const response: SuccessResponse<T> = {
        status: 'success',
        message,
        data,
    };
    res.status(statusCode).json(response);
};

/**
 * Pagination response utility
 * @param res - Express Response object
 * @param data - Paginated data to send in the response
 * @param totalItems - Total number of items available
 * @param currentPage - Current page number
 * @param pageSize - Number of items per page
 * @param message - Success message
 */
export const paginationResponse = <T>(
    res: Response,
    data: T[],
    totalItems: number,
    currentPage: number,
    pageSize: number,
    message = 'Request successful'
): void => {
    const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : 1;
    const nextPage = currentPage < totalPages ? currentPage + 1 : undefined;
    const prevPage = currentPage > 1 ? currentPage - 1 : undefined;

    const response: PaginatedResponse<T> = {
        status: 'success',
        message,
        data,
        meta: {
            currentPage,
            pageSize,
            totalItems: totalItems || data.length,
            totalPages,
            nextPage,
            prevPage
        },
    };
    res.status(200).json(response);
};
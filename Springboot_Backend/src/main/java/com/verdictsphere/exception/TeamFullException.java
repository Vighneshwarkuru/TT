package com.verdictsphere.exception;

public class TeamFullException extends RuntimeException {
    public TeamFullException(String message) {
        super(message);
    }
}

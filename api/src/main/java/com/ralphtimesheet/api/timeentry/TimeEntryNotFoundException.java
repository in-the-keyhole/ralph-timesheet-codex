package com.ralphtimesheet.api.timeentry;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class TimeEntryNotFoundException extends RuntimeException {

    public TimeEntryNotFoundException(Long id) {
        super("Time entry not found: " + id);
    }
}

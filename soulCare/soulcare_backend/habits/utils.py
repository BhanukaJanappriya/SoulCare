from datetime import date, timedelta

def get_period_start_date(frequency: str, check_date: date = None) -> date:
    """Calculates the start date of the current (or specified) tracking period."""
    if check_date is None:
        check_date = date.today()

    if frequency == 'daily':
        return check_date
    elif frequency == 'weekly':
        # Start of the week (Monday=0, Sunday=6)
        return check_date - timedelta(days=check_date.weekday())
    elif frequency == 'monthly':
        # Start of the month
        return date(check_date.year, check_date.month, 1)
    return check_date

def get_previous_period_range(frequency: str, check_date: date = None) -> tuple[date, date]:
    """Calculates the start and end date of the *previous* tracking period."""
    if check_date is None:
        check_date = date.today()

    if frequency == 'daily':
        end_date = check_date - timedelta(days=1)
        start_date = end_date
    elif frequency == 'weekly':
        current_start = get_period_start_date('weekly', check_date)
        end_date = current_start - timedelta(days=1)
        start_date = current_start - timedelta(weeks=1)
    elif frequency == 'monthly':
        current_start = get_period_start_date('monthly', check_date)
        end_date = current_start - timedelta(days=1)
        # Calculate the start of the previous month
        start_date = date(end_date.year, end_date.month, 1)
    else:
        end_date = check_date - timedelta(days=1)
        start_date = end_date

    return start_date, end_date

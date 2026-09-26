"""
Credits used this month, counted from what actually happened: plans written, chat replies and builds.
The plan (Starter, 500 credits) is fixed for the prototype; billing itself is a dummy flow.
"""

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Message, Plan, Project, User

PLAN_NAME = "Starter"
MONTHLY_CREDITS = 500
CREDITS = {"plans": 5, "replies": 1, "builds": 10}


def _month_bounds(now: datetime) -> tuple[datetime, datetime]:
    start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    end = start.replace(year=start.year + 1, month=1) if start.month == 12 else start.replace(month=start.month + 1)
    return start, end


def usage_for(db: Session, user: User) -> dict:
    start, end = _month_bounds(datetime.now(UTC))
    in_month = lambda column: (column >= start) & (column < end)  # noqa: E731

    plans = dict(
        db.execute(
            select(Plan.project_id, func.count())
            .join(Project, Project.id == Plan.project_id)
            .where(Project.user_id == user.id, in_month(Plan.created_at))
            .group_by(Plan.project_id)
        ).all()
    )
    # Every user message after the first prompt gets a reply from Architect.
    replies = dict(
        db.execute(
            select(Message.project_id, func.count())
            .join(Project, Project.id == Message.project_id)
            .where(
                Project.user_id == user.id,
                Message.role == "user",
                Message.content != Project.initial_prompt,
                in_month(Message.created_at),
            )
            .group_by(Message.project_id)
        ).all()
    )
    builds = dict(
        db.execute(
            select(Message.project_id, func.count())
            .join(Project, Project.id == Message.project_id)
            .where(
                Project.user_id == user.id,
                Message.role == "assistant",
                Message.content.like("Built your app%") | Message.content.like("Building your app%"),
                in_month(Message.created_at),
            )
            .group_by(Message.project_id)
        ).all()
    )

    projects = db.execute(select(Project.id, Project.name).where(Project.user_id == user.id)).all()
    by_project = []
    for project_id, name in projects:
        credits = (
            plans.get(project_id, 0) * CREDITS["plans"]
            + replies.get(project_id, 0) * CREDITS["replies"]
            + builds.get(project_id, 0) * CREDITS["builds"]
        )
        if credits:
            by_project.append({"project_id": project_id, "name": name, "credits": credits})
    by_project.sort(key=lambda row: row["credits"], reverse=True)

    breakdown = [
        {"kind": kind, "count": sum(counts.values()), "credits": sum(counts.values()) * CREDITS[kind]}
        for kind, counts in (("plans", plans), ("replies", replies), ("builds", builds))
    ]
    return {
        "plan_name": PLAN_NAME,
        "credits_total": MONTHLY_CREDITS,
        "credits_used": sum(row["credits"] for row in breakdown),
        "period_start": start,
        "resets_at": end,
        "breakdown": breakdown,
        "by_project": by_project,
    }

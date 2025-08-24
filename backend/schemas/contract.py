from pydantic import BaseModel, computed_field
from typing import List


class Task(BaseModel):
    name: str
    amount: float


class Contract(BaseModel):
    name: str
    tasks: List[Task]
    tags: List[str]

    @computed_field
    @property
    def total_amount(self) -> float:
        return sum(task.amount for task in self.tasks)

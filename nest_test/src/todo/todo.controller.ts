import { Controller, Get, Post, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todotable } from './todo.entity';
import { JwtAuthGuard } from 'src/strategies/jwt-auth.guard';

@Controller('task')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getTasks(@Req() req): Promise<Todotable[]> {
    const userId = req.user.userId;
    return this.todoService.getTasksByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/add')
  
  async addTask(@Req() req, @Body() taskData: { title: string }): Promise<{ message: string; tasks: Todotable[] }> {
    const userId = req.user.userId;
    const newTask: Todotable = {
      id: 0,  // Assuming id will be auto-generated
      title: taskData.title,
      user: { id: userId } as any,  // Use the user id
    };
    await this.todoService.addTask(newTask);

    const tasks = await this.todoService.getTasksByUser(userId);
    return { message: 'Task added successfully', tasks };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/update')
  async updateTask(@Req() req, @Body() taskData: { id: number; title: string }): Promise<{ message: string }> {
    const userId = req.user.userId;
    const task = await this.todoService.findTaskById(taskData.id);
    
    if (task.user.id !== userId) {
      throw new UnauthorizedException();
    }

    await this.todoService.updateTask({ ...task, title: taskData.title });
    return { message: 'Task updated successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/delete')
  async deleteTask(@Req() req, @Body() taskId: { id: number }): Promise<{ message: string }> {
    const userId = req.user.userId;
    const task = await this.todoService.findTaskById(taskId.id);

    if (task.user.id !== userId) {
      throw new UnauthorizedException();
    }

    await this.todoService.deleteTask(taskId.id);
    return { message: 'Task deleted successfully' };
  }
}
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class BlockIpInterceptor implements NestInterceptor {
  private readonly time = 30 * 60 * 1000;
  private storage = new Map<string, RateLimitRecord>();

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    let record = this.storage.get(ip);

    if (!record) {
      record = { count: 0, windowStart: now, blockedUntil: 0 };
      this.storage.set(ip, record);
      setTimeout(() => this.storage.delete(ip), this.time + 1);
    }

    if (now < record.blockedUntil)
      this.throwRateLimitException(now, record.blockedUntil);

    record.count = now - record.windowStart > 1000 ? 1 : record.count + 1;

    if (record.count > 30) {
      record.blockedUntil = now + this.time;
      this.storage.set(ip, record);
      this.throwRateLimitException(now, record.blockedUntil);
    } else record.windowStart = now;

    this.storage.set(ip, record);
    return next.handle();
  }

  private throwRateLimitException(now: number, blockedUntil: number): never {
    const totalSeconds = Math.ceil((blockedUntil - now) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const timeStr =
      (minutes > 0 ? `${minutes} minutos` : "") +
      (minutes > 0 && seconds > 0 ? " e " : "") +
      (seconds > 0 ? `${seconds} segundos` : "");
    throw new ForbiddenException(
      `Ação bloqueada. Tente novamente em ${timeStr}`,
    );
  }
}

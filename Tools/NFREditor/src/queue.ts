export default class Queue<T> {
    private array: T[] = [];

    count(): number {
        return this.array.length;
    }

    enqueue(item: T) {
        this.array.push(item);
    }
    dequeue(): T | undefined {
        return this.array.shift();
    }
    peek(): T | undefined {
        return this.array.length > 0 ? this.array[0] : undefined;
    }
}
import { ElementRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { TreeVirtualScroll } from '../models/tree-virtual-scroll.model';
export declare class TreeViewportComponent implements AfterViewInit, OnInit, OnDestroy {
    private elementRef;
    virtualScroll: TreeVirtualScroll;
    setViewport: any;
    constructor(elementRef: ElementRef, virtualScroll: TreeVirtualScroll);
    ngOnInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    getTotalHeight(): string;
    onScroll(event: Event): void;
}

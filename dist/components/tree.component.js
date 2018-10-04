import { Component, ContentChild, EventEmitter, HostListener, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { TreeModel } from '../models/tree.model';
import { TreeDraggedElement } from '../models/tree-dragged-element.model';
import { TreeOptions } from '../models/tree-options.model';
import { TreeViewportComponent } from './tree-viewport.component';
import includes from 'lodash-es/includes';
import pick from 'lodash-es/pick';
var TreeComponent = /** @class */ (function () {
    function TreeComponent(treeModel, treeDraggedElement) {
        var _this = this;
        this.treeModel = treeModel;
        this.treeDraggedElement = treeDraggedElement;
        treeModel.eventNames.forEach(function (name) { return _this[name] = new EventEmitter(); });
        treeModel.subscribeToState(function (state) { return _this.stateChange.emit(state); });
    }
    Object.defineProperty(TreeComponent.prototype, "nodes", {
        // Will be handled in ngOnChanges
        set: function (nodes) {
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeComponent.prototype, "options", {
        set: function (options) {
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeComponent.prototype, "focused", {
        set: function (value) {
            this.treeModel.setFocus(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeComponent.prototype, "state", {
        set: function (state) {
            this.treeModel.setState(state);
        },
        enumerable: true,
        configurable: true
    });
    TreeComponent.prototype.onKeydown = function ($event) {
        if (!this.treeModel.isFocused)
            return;
        if (includes(['input', 'textarea'], document.activeElement.tagName.toLowerCase()))
            return;
        var focusedNode = this.treeModel.getFocusedNode();
        this.treeModel.performKeyAction(focusedNode, $event);
    };
    TreeComponent.prototype.onMousedown = function ($event) {
        function isOutsideClick(startElement, nodeName) {
            return !startElement ? true : startElement.localName === nodeName ? false : isOutsideClick(startElement.parentElement, nodeName);
        }
        if (isOutsideClick($event.target, 'tree-root')) {
            this.treeModel.setFocus(false);
        }
    };
    TreeComponent.prototype.ngOnChanges = function (changes) {
        if (changes.options || changes.nodes) {
            this.treeModel.setData({
                options: changes.options && changes.options.currentValue,
                nodes: changes.nodes && changes.nodes.currentValue,
                events: pick(this, this.treeModel.eventNames)
            });
        }
    };
    TreeComponent.prototype.sizeChanged = function () {
        this.viewportComponent.setViewport();
    };
    TreeComponent.decorators = [
        { type: Component, args: [{
                    selector: 'Tree, tree-root',
                    providers: [TreeModel],
                    styles: [],
                    template: "\n      <tree-viewport #viewport>\n          <div\n                  class=\"angular-tree-component\"\n                  [class.node-dragging]=\"treeDraggedElement.isDragging()\"\n                  [class.angular-tree-component-rtl]=\"treeModel.options.rtl\">\n              <tree-node-collection\n                      *ngIf=\"treeModel.roots\"\n                      [nodes]=\"treeModel.roots\"\n                      [treeModel]=\"treeModel\"\n                      [templates]=\"{\n            loadingTemplate: loadingTemplate,\n            treeNodeTemplate: treeNodeTemplate,\n            treeNodeWrapperTemplate: treeNodeWrapperTemplate,\n            treeNodeFullTemplate: treeNodeFullTemplate\n          }\">\n              </tree-node-collection>\n              <tree-node-drop-slot\n                      class=\"empty-tree-drop-slot\"\n                      *ngIf=\"treeModel.isEmptyTree()\"\n                      [dropIndex]=\"0\"\n                      [node]=\"treeModel.virtualRoot\">\n              </tree-node-drop-slot>\n          </div>\n      </tree-viewport>\n  "
                },] },
    ];
    /** @nocollapse */
    TreeComponent.ctorParameters = function () { return [
        { type: TreeModel },
        { type: TreeDraggedElement }
    ]; };
    TreeComponent.propDecorators = {
        loadingTemplate: [{ type: ContentChild, args: ['loadingTemplate',] }],
        treeNodeTemplate: [{ type: ContentChild, args: ['treeNodeTemplate',] }],
        treeNodeWrapperTemplate: [{ type: ContentChild, args: ['treeNodeWrapperTemplate',] }],
        treeNodeFullTemplate: [{ type: ContentChild, args: ['treeNodeFullTemplate',] }],
        viewportComponent: [{ type: ViewChild, args: ['viewport',] }],
        nodes: [{ type: Input }],
        options: [{ type: Input }],
        focused: [{ type: Input }],
        state: [{ type: Input }],
        toggleExpanded: [{ type: Output }],
        activate: [{ type: Output }],
        deactivate: [{ type: Output }],
        nodeActivate: [{ type: Output }],
        nodeDeactivate: [{ type: Output }],
        select: [{ type: Output }],
        deselect: [{ type: Output }],
        focus: [{ type: Output }],
        blur: [{ type: Output }],
        updateData: [{ type: Output }],
        initialized: [{ type: Output }],
        moveNode: [{ type: Output }],
        copyNode: [{ type: Output }],
        loadNodeChildren: [{ type: Output }],
        changeFilter: [{ type: Output }],
        event: [{ type: Output }],
        stateChange: [{ type: Output }],
        onKeydown: [{ type: HostListener, args: ['body: keydown', ['$event'],] }],
        onMousedown: [{ type: HostListener, args: ['body: mousedown', ['$event'],] }]
    };
    return TreeComponent;
}());
export { TreeComponent };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvY29tcG9uZW50cy90cmVlLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBYSxNQUFNLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN0SSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDakQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFDMUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzNELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRWxFLE9BQU8sUUFBUSxNQUFNLG9CQUFvQixDQUFDO0FBQzFDLE9BQU8sSUFBSSxNQUFNLGdCQUFnQixDQUFDO0FBRWxDO0lBMEVFLHVCQUNTLFNBQW9CLEVBQ3BCLGtCQUFzQztRQUYvQyxpQkFNQztRQUxRLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFDcEIsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUU3QyxTQUFTLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUksSUFBSyxPQUFBLEtBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLFlBQVksRUFBRSxFQUEvQixDQUErQixDQUFDLENBQUM7UUFDeEUsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFVBQUMsS0FBSyxJQUFLLE9BQUEsS0FBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQTVCLENBQTRCLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBdENELHNCQUFhLGdDQUFLO1FBRGxCLGlDQUFpQzthQUNqQyxVQUFtQixLQUFZO1FBQy9CLENBQUM7OztPQUFBO0lBQUEs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QUFNO21DQUNOLE1BQU07K0JBQ04sTUFBTTt3QkFDTixNQUFNOzhCQUNOLE1BQU07NEJBVU4sWUFBWSxTQUFDLGVBQWUsRUFBRSxDQUFDLFFBQVEsQ0FBQzs4QkFXeEMsWUFBWSxTQUFDLGlCQUFpQixFQUFFLENBQUMsUUFBUSxDQUFDOztJQXdCN0Msb0JBQUM7Q0FBQSxBQXJIRCxJQXFIQztTQXRGWSxhQUFhIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBDb250ZW50Q2hpbGQsIEV2ZW50RW1pdHRlciwgSG9zdExpc3RlbmVyLCBJbnB1dCwgT25DaGFuZ2VzLCBPdXRwdXQsIFRlbXBsYXRlUmVmLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFRyZWVNb2RlbCB9IGZyb20gJy4uL21vZGVscy90cmVlLm1vZGVsJztcbmltcG9ydCB7IFRyZWVEcmFnZ2VkRWxlbWVudCB9IGZyb20gJy4uL21vZGVscy90cmVlLWRyYWdnZWQtZWxlbWVudC5tb2RlbCc7XG5pbXBvcnQgeyBUcmVlT3B0aW9ucyB9IGZyb20gJy4uL21vZGVscy90cmVlLW9wdGlvbnMubW9kZWwnO1xuaW1wb3J0IHsgVHJlZVZpZXdwb3J0Q29tcG9uZW50IH0gZnJvbSAnLi90cmVlLXZpZXdwb3J0LmNvbXBvbmVudCc7XG5cbmltcG9ydCBpbmNsdWRlcyBmcm9tICdsb2Rhc2gtZXMvaW5jbHVkZXMnO1xuaW1wb3J0IHBpY2sgZnJvbSAnbG9kYXNoLWVzL3BpY2snO1xuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdUcmVlLCB0cmVlLXJvb3QnLFxuICBwcm92aWRlcnM6IFtUcmVlTW9kZWxdLFxuICBzdHlsZXM6IFtdLFxuICB0ZW1wbGF0ZTogYFxuICAgICAgPHRyZWUtdmlld3BvcnQgI3ZpZXdwb3J0PlxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgIGNsYXNzPVwiYW5ndWxhci10cmVlLWNvbXBvbmVudFwiXG4gICAgICAgICAgICAgICAgICBbY2xhc3Mubm9kZS1kcmFnZ2luZ109XCJ0cmVlRHJhZ2dlZEVsZW1lbnQuaXNEcmFnZ2luZygpXCJcbiAgICAgICAgICAgICAgICAgIFtjbGFzcy5hbmd1bGFyLXRyZWUtY29tcG9uZW50LXJ0bF09XCJ0cmVlTW9kZWwub3B0aW9ucy5ydGxcIj5cbiAgICAgICAgICAgICAgPHRyZWUtbm9kZS1jb2xsZWN0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgKm5nSWY9XCJ0cmVlTW9kZWwucm9vdHNcIlxuICAgICAgICAgICAgICAgICAgICAgIFtub2Rlc109XCJ0cmVlTW9kZWwucm9vdHNcIlxuICAgICAgICAgICAgICAgICAgICAgIFt0cmVlTW9kZWxdPVwidHJlZU1vZGVsXCJcbiAgICAgICAgICAgICAgICAgICAgICBbdGVtcGxhdGVzXT1cIntcbiAgICAgICAgICAgIGxvYWRpbmdUZW1wbGF0ZTogbG9hZGluZ1RlbXBsYXRlLFxuICAgICAgICAgICAgdHJlZU5vZGVUZW1wbGF0ZTogdHJlZU5vZGVUZW1wbGF0ZSxcbiAgICAgICAgICAgIHRyZWVOb2RlV3JhcHBlclRlbXBsYXRlOiB0cmVlTm9kZVdyYXBwZXJUZW1wbGF0ZSxcbiAgICAgICAgICAgIHRyZWVOb2RlRnVsbFRlbXBsYXRlOiB0cmVlTm9kZUZ1bGxUZW1wbGF0ZVxuICAgICAgICAgIH1cIj5cbiAgICAgICAgICAgICAgPC90cmVlLW5vZGUtY29sbGVjdGlvbj5cbiAgICAgICAgICAgICAgPHRyZWUtbm9kZS1kcm9wLXNsb3RcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImVtcHR5LXRyZWUtZHJvcC1zbG90XCJcbiAgICAgICAgICAgICAgICAgICAgICAqbmdJZj1cInRyZWVNb2RlbC5pc0VtcHR5VHJlZSgpXCJcbiAgICAgICAgICAgICAgICAgICAgICBbZHJvcEluZGV4XT1cIjBcIlxuICAgICAgICAgICAgICAgICAgICAgIFtub2RlXT1cInRyZWVNb2RlbC52aXJ0dWFsUm9vdFwiPlxuICAgICAgICAgICAgICA8L3RyZWUtbm9kZS1kcm9wLXNsb3Q+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICA8L3RyZWUtdmlld3BvcnQ+XG4gIGBcbn0pXG5leHBvcnQgY2xhc3MgVHJlZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIF9ub2RlczogYW55W107XG4gIF9vcHRpb25zOiBUcmVlT3B0aW9ucztcblxuICBAQ29udGVudENoaWxkKCdsb2FkaW5nVGVtcGxhdGUnKSBsb2FkaW5nVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG4gIEBDb250ZW50Q2hpbGQoJ3RyZWVOb2RlVGVtcGxhdGUnKSB0cmVlTm9kZVRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuICBAQ29udGVudENoaWxkKCd0cmVlTm9kZVdyYXBwZXJUZW1wbGF0ZScpIHRyZWVOb2RlV3JhcHBlclRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuICBAQ29udGVudENoaWxkKCd0cmVlTm9kZUZ1bGxUZW1wbGF0ZScpIHRyZWVOb2RlRnVsbFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuICBAVmlld0NoaWxkKCd2aWV3cG9ydCcpIHZpZXdwb3J0Q29tcG9uZW50OiBUcmVlVmlld3BvcnRDb21wb25lbnQ7XG5cbiAgLy8gV2lsbCBiZSBoYW5kbGVkIGluIG5nT25DaGFuZ2VzXG4gIEBJbnB1dCgpIHNldCBub2Rlcyhub2RlczogYW55W10pIHtcbiAgfTtcblxuICBASW5wdXQoKSBzZXQgb3B0aW9ucyhvcHRpb25zOiBUcmVlT3B0aW9ucykge1xuICB9O1xuXG4gIEBJbnB1dCgpIHNldCBmb2N1c2VkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy50cmVlTW9kZWwuc2V0Rm9jdXModmFsdWUpO1xuICB9XG5cbiAgQElucHV0KCkgc2V0IHN0YXRlKHN0YXRlKSB7XG4gICAgdGhpcy50cmVlTW9kZWwuc2V0U3RhdGUoc3RhdGUpO1xuICB9XG5cbiAgQE91dHB1dCgpIHRvZ2dsZUV4cGFuZGVkO1xuICBAT3V0cHV0KCkgYWN0aXZhdGU7XG4gIEBPdXRwdXQoKSBkZWFjdGl2YXRlO1xuICBAT3V0cHV0KCkgbm9kZUFjdGl2YXRlO1xuICBAT3V0cHV0KCkgbm9kZURlYWN0aXZhdGU7XG4gIEBPdXRwdXQoKSBzZWxlY3Q7XG4gIEBPdXRwdXQoKSBkZXNlbGVjdDtcbiAgQE91dHB1dCgpIGZvY3VzO1xuICBAT3V0cHV0KCkgYmx1cjtcbiAgQE91dHB1dCgpIHVwZGF0ZURhdGE7XG4gIEBPdXRwdXQoKSBpbml0aWFsaXplZDtcbiAgQE91dHB1dCgpIG1vdmVOb2RlO1xuICBAT3V0cHV0KCkgY29weU5vZGU7XG4gIEBPdXRwdXQoKSBsb2FkTm9kZUNoaWxkcmVuO1xuICBAT3V0cHV0KCkgY2hhbmdlRmlsdGVyO1xuICBAT3V0cHV0KCkgZXZlbnQ7XG4gIEBPdXRwdXQoKSBzdGF0ZUNoYW5nZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgdHJlZU1vZGVsOiBUcmVlTW9kZWwsXG4gICAgcHVibGljIHRyZWVEcmFnZ2VkRWxlbWVudDogVHJlZURyYWdnZWRFbGVtZW50KSB7XG5cbiAgICB0cmVlTW9kZWwuZXZlbnROYW1lcy5mb3JFYWNoKChuYW1lKSA9PiB0aGlzW25hbWVdID0gbmV3IEV2ZW50RW1pdHRlcigpKTtcbiAgICB0cmVlTW9kZWwuc3Vic2NyaWJlVG9TdGF0ZSgoc3RhdGUpID0+IHRoaXMuc3RhdGVDaGFuZ2UuZW1pdChzdGF0ZSkpO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignYm9keToga2V5ZG93bicsIFsnJGV2ZW50J10pXG4gIG9uS2V5ZG93bigkZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMudHJlZU1vZGVsLmlzRm9jdXNlZCkgcmV0dXJuO1xuICAgIGlmIChpbmNsdWRlcyhbJ2lucHV0JywgJ3RleHRhcmVhJ10sXG4gICAgICBkb2N1bWVudC5hY3RpdmVFbGVtZW50LnRhZ05hbWUudG9Mb3dlckNhc2UoKSkpIHJldHVybjtcblxuICAgIGNvbnN0IGZvY3VzZWROb2RlID0gdGhpcy50cmVlTW9kZWwuZ2V0Rm9jdXNlZE5vZGUoKTtcblxuICAgIHRoaXMudHJlZU1vZGVsLnBlcmZvcm1LZXlBY3Rpb24oZm9jdXNlZE5vZGUsICRldmVudCk7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdib2R5OiBtb3VzZWRvd24nLCBbJyRldmVudCddKVxuICBvbk1vdXNlZG93bigkZXZlbnQpIHtcbiAgICBmdW5jdGlvbiBpc091dHNpZGVDbGljayhzdGFydEVsZW1lbnQ6IEVsZW1lbnQsIG5vZGVOYW1lOiBzdHJpbmcpIHtcbiAgICAgIHJldHVybiAhc3RhcnRFbGVtZW50ID8gdHJ1ZSA6IHN0YXJ0RWxlbWVudC5sb2NhbE5hbWUgPT09IG5vZGVOYW1lID8gZmFsc2UgOiBpc091dHNpZGVDbGljayhzdGFydEVsZW1lbnQucGFyZW50RWxlbWVudCwgbm9kZU5hbWUpO1xuICAgIH1cblxuICAgIGlmIChpc091dHNpZGVDbGljaygkZXZlbnQudGFyZ2V0LCAndHJlZS1yb290JykpIHtcbiAgICAgIHRoaXMudHJlZU1vZGVsLnNldEZvY3VzKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzKSB7XG4gICAgaWYgKGNoYW5nZXMub3B0aW9ucyB8fCBjaGFuZ2VzLm5vZGVzKSB7XG4gICAgICB0aGlzLnRyZWVNb2RlbC5zZXREYXRhKHtcbiAgICAgICAgb3B0aW9uczogY2hhbmdlcy5vcHRpb25zICYmIGNoYW5nZXMub3B0aW9ucy5jdXJyZW50VmFsdWUsXG4gICAgICAgIG5vZGVzOiBjaGFuZ2VzLm5vZGVzICYmIGNoYW5nZXMubm9kZXMuY3VycmVudFZhbHVlLFxuICAgICAgICBldmVudHM6IHBpY2sodGhpcywgdGhpcy50cmVlTW9kZWwuZXZlbnROYW1lcylcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHNpemVDaGFuZ2VkKCkge1xuICAgIHRoaXMudmlld3BvcnRDb21wb25lbnQuc2V0Vmlld3BvcnQoKTtcbiAgfVxufVxuIl19
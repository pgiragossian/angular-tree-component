var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { observable, computed, reaction, action } from 'mobx';
import { TREE_EVENTS } from '../constants/events';
import first from 'lodash-es/first';
import last from 'lodash-es/last';
import some from 'lodash-es/some';
import every from 'lodash-es/every';
var TreeNode = /** @class */ (function () {
    function TreeNode(data, parent, treeModel, index) {
        var _this = this;
        this.data = data;
        this.parent = parent;
        this.treeModel = treeModel;
        this.position = 0;
        this.allowDrop = function (element, $event) {
            return _this.options.allowDrop(element, { parent: _this, index: 0 }, $event);
        };
        if (this.id === undefined || this.id === null) {
            this.id = uuid();
        } // Make sure there's a unique id without overriding existing ids to work with immutable data structures
        this.index = index;
        if (this.getField('children')) {
            this._initChildren();
        }
        this.autoLoadChildren();
    }
    Object.defineProperty(TreeNode.prototype, "isHidden", {
        get: function () { return this.treeModel.isHidden(this); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "isExpanded", {
        get: function () { return this.treeModel.isExpanded(this); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "isActive", {
        get: function () { return this.treeModel.isActive(this); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "isFocused", {
        get: function () { return this.treeModel.isNodeFocused(this); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "isSelected", {
        get: function () {
            if (this.treeModel.options.useTriState) {
                if (this.isLeaf) {
                    return this.treeModel.isSelected(this);
                }
                else {
                    return some(this.children, function (node) { return node.isSelected; });
                }
            }
            else {
                return this.treeModel.isSelected(this);
            }
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "isAllSelected", {
        get: function () {
            if (this.treeModel.options.useTriState) {
                if (this.isLeaf) {
                    return this.isSelected;
                }
                else {
                    return every(this.children, function (node) { return node.isAllSelected; });
                }
            }
            else {
                return this.isSelected;
            }
        },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "isPartiallySelected", {
        get: function () {
            return this.isSelected && !this.isAllSelected;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "level", {
        get: function () {
            return this.parent ? this.parent.level + 1 : 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "path", {
        get: function () {
            return this.parent ? this.parent.path.concat([this.id]) : [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "elementRef", {
        get: function () {
            throw "Element Ref is no longer supported since introducing virtual scroll\n\n      You may use a template to obtain a reference to the element";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "originalNode", {
        get: function () { return this._originalNode; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TreeNode.prototype, "hasChildren", {
        // helper get functions:
        get: function () {
            return !!(this.getField('hasChildren') || (this.children && this.children.length > 0));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "isCollapsed", {
        get: function () { return !this.isExpanded; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "isLeaf", {
        get: function () { return !this.hasChildren; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "isRoot", {
        get: function () { return this.parent.data.virtual; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "realParent", {
        get: function () { return this.isRoot ? null : this.parent; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "options", {
        // proxy functions:
        get: function () { return this.treeModel.options; },
        enumerable: true,
        configurable: true
    });
    TreeNode.prototype.fireEvent = function (event) { this.treeModel.fireEvent(event); };
    Object.defineProperty(TreeNode.prototype, "displayField", {
        // field accessors:
        get: function () {
            return this.getField('display');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeNode.prototype, "id", {
        get: function () {
            return this.getField('id');
        },
        set: function (value) {
            this.setField('id', value);
        },
        enumerable: true,
        configurable: true
    });
    TreeNode.prototype.getField = function (key) {
        return this.data[this.options[key + "Field"]];
    };
    TreeNode.prototype.setField = function (key, value) {
        this.data[this.options[key + "Field"]] = value;
    };
    // traversing:
    TreeNode.prototype._findAdjacentSibling = function (steps, skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var siblings = this._getParentsChildren(skipHidden);
        var index = siblings.indexOf(this);
        return siblings.length > index + steps ? siblings[index + steps] : null;
    };
    TreeNode.prototype.findNextSibling = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        return this._findAdjacentSibling(+1, skipHidden);
    };
    TreeNode.prototype.findPreviousSibling = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        return this._findAdjacentSibling(-1, skipHidden);
    };
    TreeNode.prototype.getVisibleChildren = function () {
        return this.visibleChildren;
    };
    Object.defineProperty(TreeNode.prototype, "visibleChildren", {
        get: function () {
            return (this.children || []).filter(function (node) { return !node.isHidden; });
        },
        enumerable: true,
        configurable: true
    });
    TreeNode.prototype.getFirstChild = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var children = skipHidden ? this.visibleChildren : this.children;
        return first(children || []);
    };
    TreeNode.prototype.getLastChild = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var children = skipHidden ? this.visibleChildren : this.children;
        return last(children || []);
    };
    TreeNode.prototype.findNextNode = function (goInside, skipHidden) {
        if (goInside === void 0) { goInside = true; }
        if (skipHidden === void 0) { skipHidden = false; }
        return goInside && this.isExpanded && this.getFirstChild(skipHidden) ||
            this.findNextSibling(skipHidden) ||
            this.parent && this.parent.findNextNode(false, skipHidden);
    };
    TreeNode.prototype.findPreviousNode = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var previousSibling = this.findPreviousSibling(skipHidden);
        if (!previousSibling) {
            return this.realParent;
        }
        return previousSibling._getLastOpenDescendant(skipHidden);
    };
    TreeNode.prototype._getLastOpenDescendant = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var lastChild = this.getLastChild(skipHidden);
        return (this.isCollapsed || !lastChild)
            ? this
            : lastChild._getLastOpenDescendant(skipHidden);
    };
    TreeNode.prototype._getParentsChildren = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        var children = this.parent &&
            (skipHidden ? this.parent.getVisibleChildren() : this.parent.children);
        return children || [];
    };
    TreeNode.prototype.getIndexInParent = function (skipHidden) {
        if (skipHidden === void 0) { skipHidden = false; }
        return this._getParentsChildren(skipHidden).indexOf(this);
    };
    TreeNode.prototype.isDescendantOf = function (node) {
        if (this === node)
            return true;
        else
            return this.parent && this.parent.isDescendantOf(node);
    };
    TreeNode.prototype.getNodePadding = function () {
        return this.options.levelPadding * (this.level - 1) + 'px';
    };
    TreeNode.prototype.getClass = function () {
        return [this.options.nodeClass(this), "tree-node-level-" + this.level].join(' ');
    };
    TreeNode.prototype.onDrop = function ($event) {
        this.mouseAction('drop', $event.event, {
            from: $event.element,
            to: { parent: this, index: 0, dropOnNode: true }
        });
    };
    TreeNode.prototype.allowDrag = function () {
        return this.options.allowDrag(this);
    };
    // helper methods:
    TreeNode.prototype.loadNodeChildren = function () {
        var _this = this;
        if (!this.options.getChildren) {
            return Promise.resolve(); // Not getChildren method - for using redux
        }
        return Promise.resolve(this.options.getChildren(this))
            .then(function (children) {
            if (children) {
                _this.setField('children', children);
                _this._initChildren();
                _this.children.forEach(function (child) {
                    if (child.getField('isExpanded') && child.hasChildren) {
                        child.expand();
                    }
                });
            }
        }).then(function () {
            _this.fireEvent({
                eventName: TREE_EVENTS.loadNodeChildren,
                node: _this
            });
        });
    };
    TreeNode.prototype.expand = function () {
        if (!this.isExpanded) {
            this.toggleExpanded();
        }
        return this;
    };
    TreeNode.prototype.collapse = function () {
        if (this.isExpanded) {
            this.toggleExpanded();
        }
        return this;
    };
    TreeNode.prototype.doForAll = function (fn) {
        var _this = this;
        Promise.resolve(fn(this)).then(function () {
            if (_this.children) {
                _this.children.forEach(function (child) { return child.doForAll(fn); });
            }
        });
    };
    TreeNode.prototype.expandAll = function () {
        this.doForAll(function (node) { return node.expand(); });
    };
    TreeNode.prototype.collapseAll = function () {
        this.doForAll(function (node) { return node.collapse(); });
    };
    TreeNode.prototype.ensureVisible = function () {
        if (this.realParent) {
            this.realParent.expand();
            this.realParent.ensureVisible();
        }
        return this;
    };
    TreeNode.prototype.toggleExpanded = function () {
        this.setIsExpanded(!this.isExpanded);
        return this;
    };
    TreeNode.prototype.setIsExpanded = function (value) {
        if (this.hasChildren) {
            this.treeModel.setExpandedNode(this, value);
        }
        return this;
    };
    ;
    TreeNode.prototype.autoLoadChildren = function () {
        var _this = this;
        this.handler =
            reaction(function () { return _this.isExpanded; }, function (isExpanded) {
                if (!_this.children && _this.hasChildren && isExpanded) {
                    _this.loadNodeChildren();
                }
            }, { fireImmediately: true });
    };
    TreeNode.prototype.dispose = function () {
        if (this.children) {
            this.children.forEach(function (child) { return child.dispose(); });
        }
        if (this.handler) {
            this.handler();
        }
    };
    TreeNode.prototype.setIsActive = function (value, multi) {
        if (multi === void 0) { multi = false; }
        this.treeModel.setActiveNode(this, value, multi);
        if (value) {
            this.focus(this.options.scrollOnActivate);
        }
        return this;
    };
    TreeNode.prototype.setIsSelected = function (value) {
        if (this.treeModel.options.useTriState) {
            if (this.isLeaf) {
                this.treeModel.setSelectedNode(this, value);
            }
            else {
                this.visibleChildren.forEach(function (child) { return child.setIsSelected(value); });
            }
        }
        else {
            this.treeModel.setSelectedNode(this, value);
        }
        return this;
    };
    TreeNode.prototype.toggleSelected = function () {
        this.setIsSelected(!this.isSelected);
        return this;
    };
    TreeNode.prototype.toggleActivated = function (multi) {
        if (multi === void 0) { multi = false; }
        this.setIsActive(!this.isActive, multi);
        return this;
    };
    TreeNode.prototype.setActiveAndVisible = function (multi) {
        if (multi === void 0) { multi = false; }
        this.setIsActive(true, multi)
            .ensureVisible();
        setTimeout(this.scrollIntoView.bind(this));
        return this;
    };
    TreeNode.prototype.scrollIntoView = function (force) {
        if (force === void 0) { force = false; }
        this.treeModel.virtualScroll.scrollIntoView(this, force);
    };
    TreeNode.prototype.focus = function (scroll) {
        if (scroll === void 0) { scroll = true; }
        var previousNode = this.treeModel.getFocusedNode();
        this.treeModel.setFocusedNode(this);
        if (scroll) {
            this.scrollIntoView();
        }
        if (previousNode) {
            this.fireEvent({ eventName: TREE_EVENTS.blur, node: previousNode });
        }
        this.fireEvent({ eventName: TREE_EVENTS.focus, node: this });
        return this;
    };
    TreeNode.prototype.blur = function () {
        var previousNode = this.treeModel.getFocusedNode();
        this.treeModel.setFocusedNode(null);
        if (previousNode) {
            this.fireEvent({ eventName: TREE_EVENTS.blur, node: this });
        }
        return this;
    };
    TreeNode.prototype.setIsHidden = function (value) {
        this.treeModel.setIsHidden(this, value);
    };
    TreeNode.prototype.hide = function () {
        this.setIsHidden(true);
    };
    TreeNode.prototype.show = function () {
        this.setIsHidden(false);
    };
    TreeNode.prototype.mouseAction = function (actionName, $event, data) {
        if (data === void 0) { data = null; }
        this.treeModel.setFocus(true);
        var actionMapping = this.options.actionMapping.mouse;
        var action = actionMapping[actionName];
        if (action) {
            action(this.treeModel, this, $event, data);
        }
    };
    TreeNode.prototype.getSelfHeight = function () {
        return this.options.nodeHeight(this);
    };
    TreeNode.prototype._initChildren = function () {
        var _this = this;
        this.children = this.getField('children')
            .map(function (c, index) { return new TreeNode(c, _this, _this.treeModel, index); });
    };
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "isHidden", null);
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "isExpanded", null);
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "isActive", null);
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "isFocused", null);
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "isSelected", null);
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "isAllSelected", null);
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "isPartiallySelected", null);
    __decorate([
        observable,
        __metadata("design:type", Array)
    ], TreeNode.prototype, "children", void 0);
    __decorate([
        observable,
        __metadata("design:type", Number)
    ], TreeNode.prototype, "index", void 0);
    __decorate([
        observable,
        __metadata("design:type", Object)
    ], TreeNode.prototype, "position", void 0);
    __decorate([
        observable,
        __metadata("design:type", Number)
    ], TreeNode.prototype, "height", void 0);
    __decorate([
        computed,
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "level", null);
    __decorate([
        computed,
        __metadata("design:type", Array),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "path", null);
    __decorate([
        computed,
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [])
    ], TreeNode.prototype, "visibleChildren", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], TreeNode.prototype, "setIsSelected", null);
    __decorate([
        action,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TreeNode.prototype, "_initChildren", null);
    return TreeNode;
}());
export { TreeNode };
function uuid() {
    return Math.floor(Math.random() * 10000000000000);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS1ub2RlLm1vZGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vbGliL21vZGVscy90cmVlLW5vZGUubW9kZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFXLE1BQU0sRUFBcUIsTUFBTSxNQUFNLENBQUM7QUFJMUYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRWxELE9BQU8sS0FBSyxNQUFNLGlCQUFpQixDQUFDO0FBQ3BDLE9BQU8sSUFBSSxNQUFNLGdCQUFnQixDQUFDO0FBQ2xDLE9BQU8sSUFBSSxNQUFNLGdCQUFnQixDQUFDO0FBQ2xDLE9BQU8sS0FBSyxNQUFNLGlCQUFpQixDQUFDO0FBRXBDO0lBbURFLGtCQUFtQixJQUFTLEVBQVMsTUFBZ0IsRUFBUyxTQUFvQixFQUFFLEtBQWE7UUFBakcsaUJBVUM7UUFWa0IsU0FBSSxHQUFKLElBQUksQ0FBSztRQUFTLFdBQU0sR0FBTixNQUFNLENBQVU7UUFBUyxjQUFTLEdBQVQsU0FBUyxDQUFXO1FBakJ0RSxhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBdUp6QixjQUFTLEdBQUcsVUFBQyxPQUFPLEVBQUUsTUFBTztZQUMzQixPQUFPLEtBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdFLENBQUMsQ0FBQTtRQXZJQyxJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQzdDLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxFQUFFLENBQUM7U0FDbEIsQ0FBQyx1R0FBdUc7UUFDekcsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFFbkIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQzdCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztTQUN0QjtRQUNELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUEzRFMsc0JBQUksOEJBQVE7YUFBWixjQUFpQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFBQSxDQUFDO0lBQ3pELHNCQUFJLGdDQUFVO2FBQWQsY0FBbUIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBQUEsQ0FBQztJQUM3RCxzQkFBSSw4QkFBUTthQUFaLGNBQWlCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUFBLENBQUM7SUFDekQsc0JBQUksK0JBQVM7YUFBYixjQUFrQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFBQSxDQUFDO0lBQy9ELHNCQUFJLGdDQUFVO2FBQWQ7WUFDUixJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRTtnQkFDdEMsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUNmLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3hDO3FCQUFNO29CQUNMLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBQyxJQUFJLElBQUssT0FBQSxJQUFJLENBQUMsVUFBVSxFQUFmLENBQWUsQ0FBQyxDQUFDO2lCQUN2RDthQUNGO2lCQUFNO2dCQUNMLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDeEM7UUFDSCxDQUFDOzs7T0FBQTtJQUFBLENBQUM7SUFDUSxzQkFBSSxtQ0FBYTthQUFqQjtZQUNSLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO2dCQUN0QyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ2YsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO2lCQUN4QjtxQkFBTTtvQkFDTCxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFVBQUMsSUFBSSxJQUFLLE9BQUEsSUFBSSxDQUFDLGFBQWEsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO2lCQUMzRDthQUNGO2lCQUFNO2dCQUNMLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQzthQUN4QjtRQUNILENBQUM7OztPQUFBO0lBQUEsQ0FBQztJQUNRLHNCQUFJLHlDQUFtQjthQUF2QjtZQUNSLE9BQU8sSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDaEQsQ0FBQzs7O09BQUE7SUFNUyxzQkFBSSwyQkFBSzthQUFUO1lBQ1IsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqRCxDQUFDOzs7T0FBQTtJQUNTLHNCQUFJLDBCQUFJO2FBQVI7WUFDUixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxTQUFFLElBQUksQ0FBQyxFQUFFLEdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMzRCxDQUFDOzs7T0FBQTtJQUVELHNCQUFJLGdDQUFVO2FBQWQ7WUFDRSxNQUFNLDBJQUN3RCxDQUFDO1FBQ2pFLENBQUM7OztPQUFBO0lBR0Qsc0JBQUksa0NBQVk7YUFBaEIsY0FBcUIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFBQSxDQUFDO0lBZWxELHNCQUFJLGlDQUFXO1FBRGYsd0JBQXdCO2FBQ3hCO1lBQ0UsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7OztPQUFBO0lBQ0Qsc0JBQUksaUNBQVc7YUFBZixjQUE2QixPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBQ3ZELHNCQUFJLDRCQUFNO2FBQVYsY0FBd0IsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUNuRCxzQkFBSSw0QkFBTTthQUFWLGNBQXdCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs7O09BQUE7SUFDMUQsc0JBQUksZ0NBQVU7YUFBZCxjQUE2QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7OztPQUFBO0lBR3ZFLHNCQUFJLDZCQUFPO1FBRFgsbUJBQW1CO2FBQ25CLGNBQTZCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUM3RCw0QkFBUyxHQUFULFVBQVUsS0FBSyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUdyRCxzQkFBSSxrQ0FBWTtRQURoQixtQkFBbUI7YUFDbkI7WUFDRSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbEMsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSx3QkFBRTthQUFOO1lBQ0UsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLENBQUM7YUFFRCxVQUFPLEtBQUs7WUFDVixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QixDQUFDOzs7T0FKQTtJQU1ELDJCQUFRLEdBQVIsVUFBUyxHQUFHO1FBQ1YsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUksR0FBRyxVQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ2hELENBQUM7SUFFRCwyQkFBUSxHQUFSLFVBQVMsR0FBRyxFQUFFLEtBQUs7UUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFJLEdBQUcsVUFBTyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDakQsQ0FBQztJQUVELGNBQWM7SUFDZCx1Q0FBb0IsR0FBcEIsVUFBcUIsS0FBSyxFQUFFLFVBQWtCO1FBQWxCLDJCQUFBLEVBQUEsa0JBQWtCO1FBQzVDLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN0RCxJQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXJDLE9BQU8sUUFBUSxDQUFDLE1BQU0sR0FBRyxLQUFLLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDMUUsQ0FBQztJQUVELGtDQUFlLEdBQWYsVUFBZ0IsVUFBa0I7UUFBbEIsMkJBQUEsRUFBQSxrQkFBa0I7UUFDaEMsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDbkQsQ0FBQztJQUVELHNDQUFtQixHQUFuQixVQUFvQixVQUFrQjtRQUFsQiwyQkFBQSxFQUFBLGtCQUFrQjtRQUNwQyxPQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRUQscUNBQWtCLEdBQWxCO1FBQ0UsT0FBTyxJQUFJLENBQUMsZUFBZSxDQUFDO0lBQzlCLENBQUM7SUFFUyxzQkFBSSxxQ0FBZTthQUFuQjtZQUNSLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFDLElBQUksSUFBSyxPQUFBLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBZCxDQUFjLENBQUMsQ0FBQztRQUNoRSxDQUFDOzs7T0FBQTtJQUVELGdDQUFhLEdBQWIsVUFBYyxVQUFrQjtRQUFsQiwyQkFBQSxFQUFBLGtCQUFrQjtRQUM5QixJQUFJLFFBQVEsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7UUFFakUsT0FBTyxLQUFLLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFRCwrQkFBWSxHQUFaLFVBQWEsVUFBa0I7UUFBbEIsMkJBQUEsRUFBQSxrQkFBa0I7UUFDN0IsSUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBRWpFLE9BQU8sSUFBSSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRUQsK0JBQVksR0FBWixVQUFhLFFBQWUsRUFBRSxVQUFrQjtRQUFuQyx5QkFBQSxFQUFBLGVBQWU7UUFBRSwyQkFBQSxFQUFBLGtCQUFrQjtRQUM5QyxPQUFPLFFBQVEsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDO1lBQzdELElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxtQ0FBZ0IsR0FBaEIsVUFBaUIsVUFBa0I7UUFBbEIsMkJBQUEsRUFBQSxrQkFBa0I7UUFDakMsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxlQUFlLEVBQUU7WUFDcEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO1NBQ3hCO1FBQ0QsT0FBTyxlQUFlLENBQUMsc0JBQXNCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVELHlDQUFzQixHQUF0QixVQUF1QixVQUFrQjtRQUFsQiwyQkFBQSxFQUFBLGtCQUFrQjtRQUN2QyxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hELE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxJQUFJO1lBQ04sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRU8sc0NBQW1CLEdBQTNCLFVBQTRCLFVBQWtCO1FBQWxCLDJCQUFBLEVBQUEsa0JBQWtCO1FBQzVDLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNO1lBQzFCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFekUsT0FBTyxRQUFRLElBQUksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFTyxtQ0FBZ0IsR0FBeEIsVUFBeUIsVUFBa0I7UUFBbEIsMkJBQUEsRUFBQSxrQkFBa0I7UUFDekMsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCxpQ0FBYyxHQUFkLFVBQWUsSUFBYztRQUMzQixJQUFJLElBQUksS0FBSyxJQUFJO1lBQUUsT0FBTyxJQUFJLENBQUM7O1lBQzFCLE9BQU8sSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQsaUNBQWMsR0FBZDtRQUNFLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUM3RCxDQUFDO0lBRUQsMkJBQVEsR0FBUjtRQUNFLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxxQkFBb0IsSUFBSSxDQUFDLEtBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRUQseUJBQU0sR0FBTixVQUFPLE1BQU07UUFDWCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQ3JDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTztZQUNwQixFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRTtTQUNqRCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBTUQsNEJBQVMsR0FBVDtRQUNFLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUdELGtCQUFrQjtJQUNsQixtQ0FBZ0IsR0FBaEI7UUFBQSxpQkFvQkM7UUFuQkMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO1lBQzdCLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsMkNBQTJDO1NBQ3RFO1FBQ0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ25ELElBQUksQ0FBQyxVQUFDLFFBQVE7WUFDYixJQUFJLFFBQVEsRUFBRTtnQkFDWixLQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDcEMsS0FBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUNyQixLQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUs7b0JBQzFCLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFO3dCQUNyRCxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7cUJBQ2hCO2dCQUNILENBQUMsQ0FBQyxDQUFDO2FBQ047UUFBQSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDUCxLQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNiLFNBQVMsRUFBRSxXQUFXLENBQUMsZ0JBQWdCO2dCQUN2QyxJQUFJLEVBQUUsS0FBSTthQUNYLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELHlCQUFNLEdBQU47UUFDRSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNwQixJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDdkI7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCwyQkFBUSxHQUFSO1FBQ0UsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ25CLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztTQUN2QjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELDJCQUFRLEdBQVIsVUFBUyxFQUE0QjtRQUFyQyxpQkFNQztRQUxDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1lBQzdCLElBQUksS0FBSSxDQUFDLFFBQVEsRUFBRTtnQkFDakIsS0FBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFsQixDQUFrQixDQUFDLENBQUM7YUFDdEQ7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCw0QkFBUyxHQUFUO1FBQ0UsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFDLElBQUksSUFBSyxPQUFBLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBYixDQUFhLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQsOEJBQVcsR0FBWDtRQUNFLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBQyxJQUFJLElBQUssT0FBQSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQWYsQ0FBZSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVELGdDQUFhLEdBQWI7UUFDRSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbkIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQ2pDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsaUNBQWMsR0FBZDtRQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFckMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsZ0NBQWEsR0FBYixVQUFjLEtBQUs7UUFDakIsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztTQUM3QztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUFBLENBQUM7SUFFRixtQ0FBZ0IsR0FBaEI7UUFBQSxpQkFXQztRQVZDLElBQUksQ0FBQyxPQUFPO1lBQ1YsUUFBUSxDQUNOLGNBQU0sT0FBQSxLQUFJLENBQUMsVUFBVSxFQUFmLENBQWUsRUFDckIsVUFBQyxVQUFVO2dCQUNULElBQUksQ0FBQyxLQUFJLENBQUMsUUFBUSxJQUFJLEtBQUksQ0FBQyxXQUFXLElBQUksVUFBVSxFQUFFO29CQUNwRCxLQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztpQkFDekI7WUFDSCxDQUFDLEVBQ0QsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFLENBQzFCLENBQUM7SUFDTixDQUFDO0lBRUQsMEJBQU8sR0FBUDtRQUNFLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNqQixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUssSUFBSyxPQUFBLEtBQUssQ0FBQyxPQUFPLEVBQUUsRUFBZixDQUFlLENBQUMsQ0FBQztTQUNuRDtRQUNELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNoQixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7U0FDaEI7SUFDSCxDQUFDO0lBRUQsOEJBQVcsR0FBWCxVQUFZLEtBQUssRUFBRSxLQUFhO1FBQWIsc0JBQUEsRUFBQSxhQUFhO1FBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDakQsSUFBSSxLQUFLLEVBQUU7WUFDVCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztTQUMzQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVPLGdDQUFhLEdBQWIsVUFBYyxLQUFLO1FBQ3pCLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFO1lBQ3RDLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDZixJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDN0M7aUJBQU07Z0JBQ0wsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsVUFBQyxLQUFLLElBQUssT0FBQSxLQUFLLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUExQixDQUEwQixDQUFDLENBQUM7YUFDckU7U0FDRjthQUFNO1lBQ0wsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzdDO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsaUNBQWMsR0FBZDtRQUNFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFckMsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsa0NBQWUsR0FBZixVQUFnQixLQUFhO1FBQWIsc0JBQUEsRUFBQSxhQUFhO1FBQzNCLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELHNDQUFtQixHQUFuQixVQUFvQixLQUFhO1FBQWIsc0JBQUEsRUFBQSxhQUFhO1FBQy9CLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQzthQUMxQixhQUFhLEVBQUUsQ0FBQztRQUVuQixVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUUzQyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxpQ0FBYyxHQUFkLFVBQWUsS0FBYTtRQUFiLHNCQUFBLEVBQUEsYUFBYTtRQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCx3QkFBSyxHQUFMLFVBQU0sTUFBYTtRQUFiLHVCQUFBLEVBQUEsYUFBYTtRQUNqQixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ25ELElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksTUFBTSxFQUFFO1lBQ1YsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQ3ZCO1FBQ0QsSUFBSSxZQUFZLEVBQUU7WUFDaEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsQ0FBQyxDQUFDO1NBQ3JFO1FBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBRTdELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELHVCQUFJLEdBQUo7UUFDRSxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ25ELElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksWUFBWSxFQUFFO1lBQ2hCLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUM3RDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELDhCQUFXLEdBQVgsVUFBWSxLQUFLO1FBQ2YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCx1QkFBSSxHQUFKO1FBQ0UsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN6QixDQUFDO0lBRUQsdUJBQUksR0FBSjtRQUNFLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELDhCQUFXLEdBQVgsVUFBWSxVQUFrQixFQUFFLE1BQU0sRUFBRSxJQUFnQjtRQUFoQixxQkFBQSxFQUFBLFdBQWdCO1FBQ3RELElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTlCLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQztRQUN2RCxJQUFNLE1BQU0sR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFekMsSUFBSSxNQUFNLEVBQUU7WUFDVixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzVDO0lBQ0gsQ0FBQztJQUVELGdDQUFhLEdBQWI7UUFDRSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTyxnQ0FBYSxHQUFiO1FBQVIsaUJBR0M7UUFGQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDO2FBQ3RDLEdBQUcsQ0FBQyxVQUFDLENBQUMsRUFBRSxLQUFLLElBQUssT0FBQSxJQUFJLFFBQVEsQ0FBQyxDQUFDLEVBQUUsS0FBSSxFQUFFLEtBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLEVBQTVDLENBQTRDLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBMVlTO1FBQVQsUUFBUTs7OzRDQUF5RDtJQUN4RDtRQUFULFFBQVE7Ozs4Q0FBNkQ7SUFDNUQ7UUFBVCxRQUFROzs7NENBQXlEO0lBQ3hEO1FBQVQsUUFBUTs7OzZDQUErRDtJQUM5RDtRQUFULFFBQVE7Ozs4Q0FVUjtJQUNTO1FBQVQsUUFBUTs7O2lEQVVSO0lBQ1M7UUFBVCxRQUFROzs7dURBRVI7SUFFVztRQUFYLFVBQVU7OzhDQUFzQjtJQUNyQjtRQUFYLFVBQVU7OzJDQUFlO0lBQ2Q7UUFBWCxVQUFVOzs4Q0FBYztJQUNiO1FBQVgsVUFBVTs7NENBQWdCO0lBQ2pCO1FBQVQsUUFBUTs7O3lDQUVSO0lBQ1M7UUFBVCxRQUFROzs7d0NBRVI7SUE0RVM7UUFBVCxRQUFROzs7bURBRVI7SUF3TE87UUFBUCxNQUFNOzs7O2lEQVlOO0lBOEVPO1FBQVAsTUFBTTs7OztpREFHTjtJQUNILGVBQUM7Q0FBQSxBQTdZRCxJQTZZQztTQTdZWSxRQUFRO0FBK1lyQjtJQUNFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsY0FBYyxDQUFDLENBQUM7QUFDcEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IG9ic2VydmFibGUsIGNvbXB1dGVkLCByZWFjdGlvbiwgYXV0b3J1biwgYWN0aW9uLCBJUmVhY3Rpb25EaXNwb3NlciB9IGZyb20gJ21vYngnO1xuaW1wb3J0IHsgVHJlZU1vZGVsIH0gZnJvbSAnLi90cmVlLm1vZGVsJztcbmltcG9ydCB7IFRyZWVPcHRpb25zIH0gZnJvbSAnLi90cmVlLW9wdGlvbnMubW9kZWwnO1xuaW1wb3J0IHsgSVRyZWVOb2RlIH0gZnJvbSAnLi4vZGVmcy9hcGknO1xuaW1wb3J0IHsgVFJFRV9FVkVOVFMgfSBmcm9tICcuLi9jb25zdGFudHMvZXZlbnRzJztcblxuaW1wb3J0IGZpcnN0IGZyb20gJ2xvZGFzaC1lcy9maXJzdCc7XG5pbXBvcnQgbGFzdCBmcm9tICdsb2Rhc2gtZXMvbGFzdCc7XG5pbXBvcnQgc29tZSBmcm9tICdsb2Rhc2gtZXMvc29tZSc7XG5pbXBvcnQgZXZlcnkgZnJvbSAnbG9kYXNoLWVzL2V2ZXJ5JztcblxuZXhwb3J0IGNsYXNzIFRyZWVOb2RlIGltcGxlbWVudHMgSVRyZWVOb2RlIHtcbiAgcHJpdmF0ZSBoYW5kbGVyOiBJUmVhY3Rpb25EaXNwb3NlcjtcbiAgQGNvbXB1dGVkIGdldCBpc0hpZGRlbigpIHsgcmV0dXJuIHRoaXMudHJlZU1vZGVsLmlzSGlkZGVuKHRoaXMpOyB9O1xuICBAY29tcHV0ZWQgZ2V0IGlzRXhwYW5kZWQoKSB7IHJldHVybiB0aGlzLnRyZWVNb2RlbC5pc0V4cGFuZGVkKHRoaXMpOyB9O1xuICBAY29tcHV0ZWQgZ2V0IGlzQWN0aXZlKCkgeyByZXR1cm4gdGhpcy50cmVlTW9kZWwuaXNBY3RpdmUodGhpcyk7IH07XG4gIEBjb21wdXRlZCBnZXQgaXNGb2N1c2VkKCkgeyByZXR1cm4gdGhpcy50cmVlTW9kZWwuaXNOb2RlRm9jdXNlZCh0aGlzKTsgfTtcbiAgQGNvbXB1dGVkIGdldCBpc1NlbGVjdGVkKCkge1xuICAgIGlmICh0aGlzLnRyZWVNb2RlbC5vcHRpb25zLnVzZVRyaVN0YXRlKSB7XG4gICAgICBpZiAodGhpcy5pc0xlYWYpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHJlZU1vZGVsLmlzU2VsZWN0ZWQodGhpcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc29tZSh0aGlzLmNoaWxkcmVuLCAobm9kZSkgPT4gbm9kZS5pc1NlbGVjdGVkKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMudHJlZU1vZGVsLmlzU2VsZWN0ZWQodGhpcyk7XG4gICAgfVxuICB9O1xuICBAY29tcHV0ZWQgZ2V0IGlzQWxsU2VsZWN0ZWQoKSB7XG4gICAgaWYgKHRoaXMudHJlZU1vZGVsLm9wdGlvbnMudXNlVHJpU3RhdGUpIHtcbiAgICAgIGlmICh0aGlzLmlzTGVhZikge1xuICAgICAgICByZXR1cm4gdGhpcy5pc1NlbGVjdGVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGV2ZXJ5KHRoaXMuY2hpbGRyZW4sIChub2RlKSA9PiBub2RlLmlzQWxsU2VsZWN0ZWQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5pc1NlbGVjdGVkO1xuICAgIH1cbiAgfTtcbiAgQGNvbXB1dGVkIGdldCBpc1BhcnRpYWxseVNlbGVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLmlzU2VsZWN0ZWQgJiYgIXRoaXMuaXNBbGxTZWxlY3RlZDtcbiAgfVxuXG4gIEBvYnNlcnZhYmxlIGNoaWxkcmVuOiBUcmVlTm9kZVtdO1xuICBAb2JzZXJ2YWJsZSBpbmRleDogbnVtYmVyO1xuICBAb2JzZXJ2YWJsZSBwb3NpdGlvbiA9IDA7XG4gIEBvYnNlcnZhYmxlIGhlaWdodDogbnVtYmVyO1xuICBAY29tcHV0ZWQgZ2V0IGxldmVsKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50ID8gdGhpcy5wYXJlbnQubGV2ZWwgKyAxIDogMDtcbiAgfVxuICBAY29tcHV0ZWQgZ2V0IHBhdGgoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLnBhcmVudCA/IFsuLi50aGlzLnBhcmVudC5wYXRoLCB0aGlzLmlkXSA6IFtdO1xuICB9XG5cbiAgZ2V0IGVsZW1lbnRSZWYoKTogYW55IHtcbiAgICB0aHJvdyBgRWxlbWVudCBSZWYgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCBzaW5jZSBpbnRyb2R1Y2luZyB2aXJ0dWFsIHNjcm9sbFxcblxuICAgICAgWW91IG1heSB1c2UgYSB0ZW1wbGF0ZSB0byBvYnRhaW4gYSByZWZlcmVuY2UgdG8gdGhlIGVsZW1lbnRgO1xuICB9XG5cbiAgcHJpdmF0ZSBfb3JpZ2luYWxOb2RlOiBhbnk7XG4gIGdldCBvcmlnaW5hbE5vZGUoKSB7IHJldHVybiB0aGlzLl9vcmlnaW5hbE5vZGU7IH07XG5cbiAgY29uc3RydWN0b3IocHVibGljIGRhdGE6IGFueSwgcHVibGljIHBhcmVudDogVHJlZU5vZGUsIHB1YmxpYyB0cmVlTW9kZWw6IFRyZWVNb2RlbCwgaW5kZXg6IG51bWJlcikge1xuICAgIGlmICh0aGlzLmlkID09PSB1bmRlZmluZWQgfHwgdGhpcy5pZCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5pZCA9IHV1aWQoKTtcbiAgICB9IC8vIE1ha2Ugc3VyZSB0aGVyZSdzIGEgdW5pcXVlIGlkIHdpdGhvdXQgb3ZlcnJpZGluZyBleGlzdGluZyBpZHMgdG8gd29yayB3aXRoIGltbXV0YWJsZSBkYXRhIHN0cnVjdHVyZXNcbiAgICB0aGlzLmluZGV4ID0gaW5kZXg7XG5cbiAgICBpZiAodGhpcy5nZXRGaWVsZCgnY2hpbGRyZW4nKSkge1xuICAgICAgdGhpcy5faW5pdENoaWxkcmVuKCk7XG4gICAgfVxuICAgIHRoaXMuYXV0b0xvYWRDaGlsZHJlbigpO1xuICB9XG5cbiAgLy8gaGVscGVyIGdldCBmdW5jdGlvbnM6XG4gIGdldCBoYXNDaGlsZHJlbigpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISEodGhpcy5nZXRGaWVsZCgnaGFzQ2hpbGRyZW4nKSB8fCAodGhpcy5jaGlsZHJlbiAmJiB0aGlzLmNoaWxkcmVuLmxlbmd0aCA+IDApKTtcbiAgfVxuICBnZXQgaXNDb2xsYXBzZWQoKTogYm9vbGVhbiB7IHJldHVybiAhdGhpcy5pc0V4cGFuZGVkOyB9XG4gIGdldCBpc0xlYWYoKTogYm9vbGVhbiB7IHJldHVybiAhdGhpcy5oYXNDaGlsZHJlbjsgfVxuICBnZXQgaXNSb290KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5wYXJlbnQuZGF0YS52aXJ0dWFsOyB9XG4gIGdldCByZWFsUGFyZW50KCk6IFRyZWVOb2RlIHsgcmV0dXJuIHRoaXMuaXNSb290ID8gbnVsbCA6IHRoaXMucGFyZW50OyB9XG5cbiAgLy8gcHJveHkgZnVuY3Rpb25zOlxuICBnZXQgb3B0aW9ucygpOiBUcmVlT3B0aW9ucyB7IHJldHVybiB0aGlzLnRyZWVNb2RlbC5vcHRpb25zOyB9XG4gIGZpcmVFdmVudChldmVudCkgeyB0aGlzLnRyZWVNb2RlbC5maXJlRXZlbnQoZXZlbnQpOyB9XG5cbiAgLy8gZmllbGQgYWNjZXNzb3JzOlxuICBnZXQgZGlzcGxheUZpZWxkKCkge1xuICAgIHJldHVybiB0aGlzLmdldEZpZWxkKCdkaXNwbGF5Jyk7XG4gIH1cblxuICBnZXQgaWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0RmllbGQoJ2lkJyk7XG4gIH1cblxuICBzZXQgaWQodmFsdWUpIHtcbiAgICB0aGlzLnNldEZpZWxkKCdpZCcsIHZhbHVlKTtcbiAgfVxuXG4gIGdldEZpZWxkKGtleSkge1xuICAgIHJldHVybiB0aGlzLmRhdGFbdGhpcy5vcHRpb25zW2Ake2tleX1GaWVsZGBdXTtcbiAgfVxuXG4gIHNldEZpZWxkKGtleSwgdmFsdWUpIHtcbiAgICB0aGlzLmRhdGFbdGhpcy5vcHRpb25zW2Ake2tleX1GaWVsZGBdXSA9IHZhbHVlO1xuICB9XG5cbiAgLy8gdHJhdmVyc2luZzpcbiAgX2ZpbmRBZGphY2VudFNpYmxpbmcoc3RlcHMsIHNraXBIaWRkZW4gPSBmYWxzZSkge1xuICAgIGNvbnN0IHNpYmxpbmdzID0gdGhpcy5fZ2V0UGFyZW50c0NoaWxkcmVuKHNraXBIaWRkZW4pO1xuICAgIGNvbnN0IGluZGV4ID0gc2libGluZ3MuaW5kZXhPZih0aGlzKTtcblxuICAgIHJldHVybiBzaWJsaW5ncy5sZW5ndGggPiBpbmRleCArIHN0ZXBzID8gc2libGluZ3NbaW5kZXggKyBzdGVwc10gOiBudWxsO1xuICB9XG5cbiAgZmluZE5leHRTaWJsaW5nKHNraXBIaWRkZW4gPSBmYWxzZSkge1xuICAgIHJldHVybiB0aGlzLl9maW5kQWRqYWNlbnRTaWJsaW5nKCsxLCBza2lwSGlkZGVuKTtcbiAgfVxuXG4gIGZpbmRQcmV2aW91c1NpYmxpbmcoc2tpcEhpZGRlbiA9IGZhbHNlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbmRBZGphY2VudFNpYmxpbmcoLTEsIHNraXBIaWRkZW4pO1xuICB9XG5cbiAgZ2V0VmlzaWJsZUNoaWxkcmVuKCkge1xuICAgIHJldHVybiB0aGlzLnZpc2libGVDaGlsZHJlbjtcbiAgfVxuXG4gIEBjb21wdXRlZCBnZXQgdmlzaWJsZUNoaWxkcmVuKCkge1xuICAgIHJldHVybiAodGhpcy5jaGlsZHJlbiB8fCBbXSkuZmlsdGVyKChub2RlKSA9PiAhbm9kZS5pc0hpZGRlbik7XG4gIH1cblxuICBnZXRGaXJzdENoaWxkKHNraXBIaWRkZW4gPSBmYWxzZSkge1xuICAgIGxldCBjaGlsZHJlbiA9IHNraXBIaWRkZW4gPyB0aGlzLnZpc2libGVDaGlsZHJlbiA6IHRoaXMuY2hpbGRyZW47XG5cbiAgICByZXR1cm4gZmlyc3QoY2hpbGRyZW4gfHwgW10pO1xuICB9XG5cbiAgZ2V0TGFzdENoaWxkKHNraXBIaWRkZW4gPSBmYWxzZSkge1xuICAgIGxldCBjaGlsZHJlbiA9IHNraXBIaWRkZW4gPyB0aGlzLnZpc2libGVDaGlsZHJlbiA6IHRoaXMuY2hpbGRyZW47XG5cbiAgICByZXR1cm4gbGFzdChjaGlsZHJlbiB8fCBbXSk7XG4gIH1cblxuICBmaW5kTmV4dE5vZGUoZ29JbnNpZGUgPSB0cnVlLCBza2lwSGlkZGVuID0gZmFsc2UpIHtcbiAgICByZXR1cm4gZ29JbnNpZGUgJiYgdGhpcy5pc0V4cGFuZGVkICYmIHRoaXMuZ2V0Rmlyc3RDaGlsZChza2lwSGlkZGVuKSB8fFxuICAgICAgICAgICB0aGlzLmZpbmROZXh0U2libGluZyhza2lwSGlkZGVuKSB8fFxuICAgICAgICAgICB0aGlzLnBhcmVudCAmJiB0aGlzLnBhcmVudC5maW5kTmV4dE5vZGUoZmFsc2UsIHNraXBIaWRkZW4pO1xuICB9XG5cbiAgZmluZFByZXZpb3VzTm9kZShza2lwSGlkZGVuID0gZmFsc2UpIHtcbiAgICBsZXQgcHJldmlvdXNTaWJsaW5nID0gdGhpcy5maW5kUHJldmlvdXNTaWJsaW5nKHNraXBIaWRkZW4pO1xuICAgIGlmICghcHJldmlvdXNTaWJsaW5nKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZWFsUGFyZW50O1xuICAgIH1cbiAgICByZXR1cm4gcHJldmlvdXNTaWJsaW5nLl9nZXRMYXN0T3BlbkRlc2NlbmRhbnQoc2tpcEhpZGRlbik7XG4gIH1cblxuICBfZ2V0TGFzdE9wZW5EZXNjZW5kYW50KHNraXBIaWRkZW4gPSBmYWxzZSkge1xuICAgIGNvbnN0IGxhc3RDaGlsZCA9IHRoaXMuZ2V0TGFzdENoaWxkKHNraXBIaWRkZW4pO1xuICAgIHJldHVybiAodGhpcy5pc0NvbGxhcHNlZCB8fCAhbGFzdENoaWxkKVxuICAgICAgPyB0aGlzXG4gICAgICA6IGxhc3RDaGlsZC5fZ2V0TGFzdE9wZW5EZXNjZW5kYW50KHNraXBIaWRkZW4pO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0UGFyZW50c0NoaWxkcmVuKHNraXBIaWRkZW4gPSBmYWxzZSk6IGFueVtdIHtcbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMucGFyZW50ICYmXG4gICAgICAoc2tpcEhpZGRlbiA/IHRoaXMucGFyZW50LmdldFZpc2libGVDaGlsZHJlbigpIDogdGhpcy5wYXJlbnQuY2hpbGRyZW4pO1xuXG4gICAgcmV0dXJuIGNoaWxkcmVuIHx8IFtdO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRJbmRleEluUGFyZW50KHNraXBIaWRkZW4gPSBmYWxzZSkge1xuICAgIHJldHVybiB0aGlzLl9nZXRQYXJlbnRzQ2hpbGRyZW4oc2tpcEhpZGRlbikuaW5kZXhPZih0aGlzKTtcbiAgfVxuXG4gIGlzRGVzY2VuZGFudE9mKG5vZGU6IFRyZWVOb2RlKSB7XG4gICAgaWYgKHRoaXMgPT09IG5vZGUpIHJldHVybiB0cnVlO1xuICAgIGVsc2UgcmV0dXJuIHRoaXMucGFyZW50ICYmIHRoaXMucGFyZW50LmlzRGVzY2VuZGFudE9mKG5vZGUpO1xuICB9XG5cbiAgZ2V0Tm9kZVBhZGRpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmxldmVsUGFkZGluZyAqICh0aGlzLmxldmVsIC0gMSkgKyAncHgnO1xuICB9XG5cbiAgZ2V0Q2xhc3MoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gW3RoaXMub3B0aW9ucy5ub2RlQ2xhc3ModGhpcyksIGB0cmVlLW5vZGUtbGV2ZWwtJHsgdGhpcy5sZXZlbCB9YF0uam9pbignICcpO1xuICB9XG5cbiAgb25Ecm9wKCRldmVudCkge1xuICAgIHRoaXMubW91c2VBY3Rpb24oJ2Ryb3AnLCAkZXZlbnQuZXZlbnQsIHtcbiAgICAgIGZyb206ICRldmVudC5lbGVtZW50LFxuICAgICAgdG86IHsgcGFyZW50OiB0aGlzLCBpbmRleDogMCwgZHJvcE9uTm9kZTogdHJ1ZSB9XG4gICAgfSk7XG4gIH1cblxuICBhbGxvd0Ryb3AgPSAoZWxlbWVudCwgJGV2ZW50PykgPT4ge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuYWxsb3dEcm9wKGVsZW1lbnQsIHsgcGFyZW50OiB0aGlzLCBpbmRleDogMCB9LCAkZXZlbnQpO1xuICB9XG5cbiAgYWxsb3dEcmFnKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMuYWxsb3dEcmFnKHRoaXMpO1xuICB9XG5cblxuICAvLyBoZWxwZXIgbWV0aG9kczpcbiAgbG9hZE5vZGVDaGlsZHJlbigpIHtcbiAgICBpZiAoIXRoaXMub3B0aW9ucy5nZXRDaGlsZHJlbikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpOyAvLyBOb3QgZ2V0Q2hpbGRyZW4gbWV0aG9kIC0gZm9yIHVzaW5nIHJlZHV4XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5vcHRpb25zLmdldENoaWxkcmVuKHRoaXMpKVxuICAgICAgLnRoZW4oKGNoaWxkcmVuKSA9PiB7XG4gICAgICAgIGlmIChjaGlsZHJlbikge1xuICAgICAgICAgIHRoaXMuc2V0RmllbGQoJ2NoaWxkcmVuJywgY2hpbGRyZW4pO1xuICAgICAgICAgIHRoaXMuX2luaXRDaGlsZHJlbigpO1xuICAgICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgICAgIGlmIChjaGlsZC5nZXRGaWVsZCgnaXNFeHBhbmRlZCcpICYmIGNoaWxkLmhhc0NoaWxkcmVuKSB7XG4gICAgICAgICAgICAgIGNoaWxkLmV4cGFuZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfX0pLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLmZpcmVFdmVudCh7XG4gICAgICAgICAgZXZlbnROYW1lOiBUUkVFX0VWRU5UUy5sb2FkTm9kZUNoaWxkcmVuLFxuICAgICAgICAgIG5vZGU6IHRoaXNcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZCgpIHtcbiAgICBpZiAoIXRoaXMuaXNFeHBhbmRlZCkge1xuICAgICAgdGhpcy50b2dnbGVFeHBhbmRlZCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY29sbGFwc2UoKSB7XG4gICAgaWYgKHRoaXMuaXNFeHBhbmRlZCkge1xuICAgICAgdGhpcy50b2dnbGVFeHBhbmRlZCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZG9Gb3JBbGwoZm46IChub2RlOiBJVHJlZU5vZGUpID0+IGFueSkge1xuICAgIFByb21pc2UucmVzb2x2ZShmbih0aGlzKSkudGhlbigoKSA9PiB7XG4gICAgICBpZiAodGhpcy5jaGlsZHJlbikge1xuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiBjaGlsZC5kb0ZvckFsbChmbikpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kQWxsKCkge1xuICAgIHRoaXMuZG9Gb3JBbGwoKG5vZGUpID0+IG5vZGUuZXhwYW5kKCkpO1xuICB9XG5cbiAgY29sbGFwc2VBbGwoKSB7XG4gICAgdGhpcy5kb0ZvckFsbCgobm9kZSkgPT4gbm9kZS5jb2xsYXBzZSgpKTtcbiAgfVxuXG4gIGVuc3VyZVZpc2libGUoKSB7XG4gICAgaWYgKHRoaXMucmVhbFBhcmVudCkge1xuICAgICAgdGhpcy5yZWFsUGFyZW50LmV4cGFuZCgpO1xuICAgICAgdGhpcy5yZWFsUGFyZW50LmVuc3VyZVZpc2libGUoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRvZ2dsZUV4cGFuZGVkKCkge1xuICAgIHRoaXMuc2V0SXNFeHBhbmRlZCghdGhpcy5pc0V4cGFuZGVkKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0SXNFeHBhbmRlZCh2YWx1ZSkge1xuICAgIGlmICh0aGlzLmhhc0NoaWxkcmVuKSB7XG4gICAgICB0aGlzLnRyZWVNb2RlbC5zZXRFeHBhbmRlZE5vZGUodGhpcywgdmFsdWUpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIGF1dG9Mb2FkQ2hpbGRyZW4oKSB7XG4gICAgdGhpcy5oYW5kbGVyID1cbiAgICAgIHJlYWN0aW9uKFxuICAgICAgICAoKSA9PiB0aGlzLmlzRXhwYW5kZWQsXG4gICAgICAgIChpc0V4cGFuZGVkKSA9PiB7XG4gICAgICAgICAgaWYgKCF0aGlzLmNoaWxkcmVuICYmIHRoaXMuaGFzQ2hpbGRyZW4gJiYgaXNFeHBhbmRlZCkge1xuICAgICAgICAgICAgdGhpcy5sb2FkTm9kZUNoaWxkcmVuKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7IGZpcmVJbW1lZGlhdGVseTogdHJ1ZSB9XG4gICAgICApO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5jaGlsZHJlbikge1xuICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4gY2hpbGQuZGlzcG9zZSgpKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuaGFuZGxlcikge1xuICAgICAgdGhpcy5oYW5kbGVyKCk7XG4gICAgfVxuICB9XG5cbiAgc2V0SXNBY3RpdmUodmFsdWUsIG11bHRpID0gZmFsc2UpIHtcbiAgICB0aGlzLnRyZWVNb2RlbC5zZXRBY3RpdmVOb2RlKHRoaXMsIHZhbHVlLCBtdWx0aSk7XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB0aGlzLmZvY3VzKHRoaXMub3B0aW9ucy5zY3JvbGxPbkFjdGl2YXRlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIEBhY3Rpb24gc2V0SXNTZWxlY3RlZCh2YWx1ZSkge1xuICAgIGlmICh0aGlzLnRyZWVNb2RlbC5vcHRpb25zLnVzZVRyaVN0YXRlKSB7XG4gICAgICBpZiAodGhpcy5pc0xlYWYpIHtcbiAgICAgICAgdGhpcy50cmVlTW9kZWwuc2V0U2VsZWN0ZWROb2RlKHRoaXMsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudmlzaWJsZUNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiBjaGlsZC5zZXRJc1NlbGVjdGVkKHZhbHVlKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudHJlZU1vZGVsLnNldFNlbGVjdGVkTm9kZSh0aGlzLCB2YWx1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0b2dnbGVTZWxlY3RlZCgpIHtcbiAgICB0aGlzLnNldElzU2VsZWN0ZWQoIXRoaXMuaXNTZWxlY3RlZCk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHRvZ2dsZUFjdGl2YXRlZChtdWx0aSA9IGZhbHNlKSB7XG4gICAgdGhpcy5zZXRJc0FjdGl2ZSghdGhpcy5pc0FjdGl2ZSwgbXVsdGkpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRBY3RpdmVBbmRWaXNpYmxlKG11bHRpID0gZmFsc2UpIHtcbiAgICB0aGlzLnNldElzQWN0aXZlKHRydWUsIG11bHRpKVxuICAgICAgLmVuc3VyZVZpc2libGUoKTtcblxuICAgIHNldFRpbWVvdXQodGhpcy5zY3JvbGxJbnRvVmlldy5iaW5kKHRoaXMpKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2Nyb2xsSW50b1ZpZXcoZm9yY2UgPSBmYWxzZSkge1xuICAgIHRoaXMudHJlZU1vZGVsLnZpcnR1YWxTY3JvbGwuc2Nyb2xsSW50b1ZpZXcodGhpcywgZm9yY2UpO1xuICB9XG5cbiAgZm9jdXMoc2Nyb2xsID0gdHJ1ZSkge1xuICAgIGxldCBwcmV2aW91c05vZGUgPSB0aGlzLnRyZWVNb2RlbC5nZXRGb2N1c2VkTm9kZSgpO1xuICAgIHRoaXMudHJlZU1vZGVsLnNldEZvY3VzZWROb2RlKHRoaXMpO1xuICAgIGlmIChzY3JvbGwpIHtcbiAgICAgIHRoaXMuc2Nyb2xsSW50b1ZpZXcoKTtcbiAgICB9XG4gICAgaWYgKHByZXZpb3VzTm9kZSkge1xuICAgICAgdGhpcy5maXJlRXZlbnQoeyBldmVudE5hbWU6IFRSRUVfRVZFTlRTLmJsdXIsIG5vZGU6IHByZXZpb3VzTm9kZSB9KTtcbiAgICB9XG4gICAgdGhpcy5maXJlRXZlbnQoeyBldmVudE5hbWU6IFRSRUVfRVZFTlRTLmZvY3VzLCBub2RlOiB0aGlzIH0pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBibHVyKCkge1xuICAgIGxldCBwcmV2aW91c05vZGUgPSB0aGlzLnRyZWVNb2RlbC5nZXRGb2N1c2VkTm9kZSgpO1xuICAgIHRoaXMudHJlZU1vZGVsLnNldEZvY3VzZWROb2RlKG51bGwpO1xuICAgIGlmIChwcmV2aW91c05vZGUpIHtcbiAgICAgIHRoaXMuZmlyZUV2ZW50KHsgZXZlbnROYW1lOiBUUkVFX0VWRU5UUy5ibHVyLCBub2RlOiB0aGlzIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2V0SXNIaWRkZW4odmFsdWUpIHtcbiAgICB0aGlzLnRyZWVNb2RlbC5zZXRJc0hpZGRlbih0aGlzLCB2YWx1ZSk7XG4gIH1cblxuICBoaWRlKCkge1xuICAgIHRoaXMuc2V0SXNIaWRkZW4odHJ1ZSk7XG4gIH1cblxuICBzaG93KCkge1xuICAgIHRoaXMuc2V0SXNIaWRkZW4oZmFsc2UpO1xuICB9XG5cbiAgbW91c2VBY3Rpb24oYWN0aW9uTmFtZTogc3RyaW5nLCAkZXZlbnQsIGRhdGE6IGFueSA9IG51bGwpIHtcbiAgICB0aGlzLnRyZWVNb2RlbC5zZXRGb2N1cyh0cnVlKTtcblxuICAgIGNvbnN0IGFjdGlvbk1hcHBpbmcgPSB0aGlzLm9wdGlvbnMuYWN0aW9uTWFwcGluZy5tb3VzZTtcbiAgICBjb25zdCBhY3Rpb24gPSBhY3Rpb25NYXBwaW5nW2FjdGlvbk5hbWVdO1xuXG4gICAgaWYgKGFjdGlvbikge1xuICAgICAgYWN0aW9uKHRoaXMudHJlZU1vZGVsLCB0aGlzLCAkZXZlbnQsIGRhdGEpO1xuICAgIH1cbiAgfVxuXG4gIGdldFNlbGZIZWlnaHQoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy5ub2RlSGVpZ2h0KHRoaXMpO1xuICB9XG5cbiAgQGFjdGlvbiBfaW5pdENoaWxkcmVuKCkge1xuICAgIHRoaXMuY2hpbGRyZW4gPSB0aGlzLmdldEZpZWxkKCdjaGlsZHJlbicpXG4gICAgICAubWFwKChjLCBpbmRleCkgPT4gbmV3IFRyZWVOb2RlKGMsIHRoaXMsIHRoaXMudHJlZU1vZGVsLCBpbmRleCkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIHV1aWQoKSB7XG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwMDAwMDAwMCk7XG59XG4iXX0=
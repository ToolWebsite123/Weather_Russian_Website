"use client";

import { useEffect } from "react";

/**
 * Fixes React runtime crashes caused by Google Translate or browser extensions modifying DOM nodes
 * (NotFoundError: Failed to execute 'removeChild' on 'Node').
 */
export function DomNodeFix() {
  useEffect(() => {
    if (typeof window === "undefined" || !window.Node) return;

    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child.parentNode !== this) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[DomNodeFix] removeChild mismatch patch triggered. Parent: <${this.nodeName}>, Child: <${child.nodeName}>. This may indicate a third-party extension (e.g. Google Translate) or a hydration/DOM bug worth investigating.`
          );
        }
        if (child.parentNode) {
          return child.parentNode.removeChild(child) as T;
        }
        return child;
      }
      return originalRemoveChild.call(this, child) as T;
    };

    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(
      newNode: T,
      referenceNode: Node | null,
    ): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[DomNodeFix] insertBefore mismatch patch triggered. Parent: <${this.nodeName}>, NewNode: <${newNode.nodeName}>, ReferenceNode: <${referenceNode.nodeName}>. This may indicate a third-party extension (e.g. Google Translate) or a hydration/DOM bug worth investigating.`
          );
        }
        if (referenceNode.parentNode) {
          return referenceNode.parentNode.insertBefore(
            newNode,
            referenceNode,
          ) as T;
        }
      }
      return originalInsertBefore.call(this, newNode, referenceNode) as T;
    };
  }, []);

  return null;
}

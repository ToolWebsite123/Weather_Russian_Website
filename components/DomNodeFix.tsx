"use client";

import { useEffect } from "react";

/**
 * DEFENSIVE DOM MONKEY-PATCH (DOM Node Removal & Insertion Safety)
 *
 * Why this exists:
 * Third-party browser extensions (especially Google Translate, Grammarly, and ad blockers)
 * inject text nodes or mutate raw DOM elements without informing React's virtual DOM tree.
 * When React attempts to re-render, unmount, or reconcile elements (e.g., during page navigation
 * or dynamic weather view tabs), calls to `Node.prototype.removeChild` or `Node.prototype.insertBefore`
 * fail with a fatal unhandled error:
 * "NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node."
 *
 * What breaks without it:
 * Users running Google Translate on foreign/Russian weather descriptions experience complete React client-side UI crashes.
 *
 * TODO: Revisit if a future React 19+ concurrent reconciliation mechanism natively handles extension-mutated DOM nodes
 * without requiring prototype patching.
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

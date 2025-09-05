// Example React components using the new CS2/Steam design system

import React from 'react'
import { Eye, Star } from 'lucide-react'

// Primary "Inspect" button
export function InspectButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="btn-primary rounded-lg py-2.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
    >
      <Eye size={16} />
      Inspect
    </a>
  )
}

// ListingCard with header, metric chips, and CTA row
export function ListingCard({ listing }: { listing: any }) {
  return (
    <div className="group card p-0 overflow-hidden transition-all duration-200">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-4">
            <h3 className="font-semibold text-foreground text-sm leading-tight mb-2 group-hover:text-primary transition-colors">
              {listing.name}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <span className="badge badge-stattrak">ST™</span>
              <span className="badge badge-float-highlight">Low Float</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              ${listing.price}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="surface-2 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Float Value</div>
            <div className="font-mono font-semibold text-success">
              {listing.float?.toFixed(6)}
            </div>
          </div>
          <div className="surface-2 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Pattern</div>
            <div className="font-mono text-sm text-foreground">
              {listing.pattern}
            </div>
          </div>
        </div>

        {/* CTA Row */}
        <div className="flex gap-2">
          <InspectButton href={listing.inspectLink} />
          <button className="btn-secondary rounded-lg p-2.5 transition-all duration-200">
            <Star size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Filter buttons with focused input
export function FilterButtons() {
  return (
    <div className="space-y-4">
      {/* Primary vs Subtle buttons */}
      <div className="flex gap-2">
        <button className="btn-primary rounded-xl py-4 px-6 font-semibold">
          Apply Filters
        </button>
        <button className="btn-subtle rounded-xl py-3 px-6 font-medium flex items-center gap-2">
          Reset All
        </button>
      </div>

      {/* Focused input example */}
      <div className="relative">
        <input
          placeholder="Search by weapon name..."
          className="input w-full pl-4 pr-4 py-3 focus:shadow-focus"
        />
      </div>
    </div>
  )
}

// Badge examples
export function BadgeExamples() {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="badge badge-success">Factory New</span>
      <span className="badge badge-warning">Field-Tested</span>
      <span className="badge badge-danger">Battle-Scarred</span>
      <span className="badge badge-info">Live Market</span>
      <span className="badge badge-stattrak">ST™</span>
      <span className="badge badge-primary">Low Float</span>
    </div>
  )
}
import React from 'react';

/**
 * Component to demonstrate improved contrast and readability
 */
export const ContrastExample = () => {
  return (
    <div className="p-6 space-y-8">
      <div className="bg-surface-1 p-6 rounded-lg shadow-md">
        <h2 className="text-content-primary text-2xl font-semibold mb-4">
          Improved Contrast Example
        </h2>
        
        <p className="text-content-primary mb-4">
          This text now has much better contrast against the background, making it easier to read.
          The text is now darker and more defined, with improved line height for better readability.
        </p>
        
        <p className="text-content-secondary mb-4">
          Secondary content is also more readable with improved contrast ratio while still being
          visually distinct from primary content.
        </p>
        
        <div className="bg-surface-2 p-4 rounded-md mb-4">
          <p className="text-content-primary">
            Even when placed on a slightly different background surface, text remains highly readable.
          </p>
        </div>
        
        <div className="prose max-w-none">
          <h3>Enhanced Typography for Long Form Content</h3>
          <p>
            Our prose styles now feature improved line height, slightly wider character spacing, and
            better contrast. This makes long-form content much easier to read, reducing eye strain
            and improving overall accessibility.
          </p>
          <p>
            The text rendering has been optimized for legibility with anti-aliasing and font feature
            adjustments that make text appear cleaner and more defined on various screen types.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg shadow-md">
          <h3 className="font-semibold text-xl text-card-foreground mb-3">
            Card with Improved Contrast
          </h3>
          <p className="text-card-foreground">
            Card text is now easier to read with higher contrast foreground colors.
          </p>
          <p className="text-secondary mt-2">
            Secondary text in cards maintains proper hierarchy while remaining readable.
          </p>
        </div>
        
        <div className="bg-brand-primary p-6 rounded-lg shadow-md text-content-onPrimary">
          <h3 className="font-semibold text-xl mb-3">
            Contrast on Colored Backgrounds
          </h3>
          <p>
            Text on colored backgrounds now has sufficient contrast to ensure readability
            without straining the eyes.
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-heading-xl mb-4">Text Hierarchy Examples</h2>
        <h1 className="text-display-xl font-bold text-content-primary">Main Heading</h1>
        <h2 className="text-display-lg font-semibold text-content-primary">Section Heading</h2>
        <h3 className="text-display font-medium text-content-primary">Subsection Heading</h3>
        <p className="text-body-lg text-content-primary">Larger body text for important information.</p>
        <p className="text-body text-content-primary">Standard body text with improved readability.</p>
        <p className="text-body-sm text-content-secondary">Smaller body text for less important content.</p>
        <p className="text-caption text-content-tertiary">Caption text remains readable despite being smaller.</p>
      </div>
    </div>
  );
};

export default ContrastExample;
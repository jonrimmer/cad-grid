# Creating a fast CAD-style grid for the web

In order to create a grid that is zoomable and pannable, we need to think in terms of two separate coordinate spaces.

The first coordinate space is the *screen*. This is easy to think about: Its (0, 0) origin is the top left corner of
the canvas object, and  aach point specified by an x and y coordinate corresponds to a single pixel on the screen.

When talking about screen coordinates, we will use the terms sx and sy.

We might also think about the size of the screen space being limited to width and height of the canvas element. However,
it is more typical to think of the coordinate space itself as being infinitely large. Instead, we think of the width
and height of the canvas as being a window into the coordinate space, sometimes called a *viewport*.

The second coordinate space we will call the *domain*. It is more abstract than the screen. It has a (0, 0) origin,
but its coordinates to not correspond to pixels, or to anything concrete.

When talking about domain coordinates, we will use the terms dx and dy.

Our grid will be specified in terms of the domain space. E.g. each grid line will only have a fixed position in the
domain. A grid with a vertical spacing of ten corresponds to lines at dy = 0, dy = 10, dy = 20, etc., stretching
infinitely in positive and negative directions.

In order to draw the grid, we will need to define a *mapping* between the two coordinate spaces. This lets us take a
point in one space and easily work out its position in the other. This mapping needs to work both ways. We need to
map from the domain to the screen in order to work out the position of grid lines on the screen. And we need to
map from the screen to the domain in order to work out how mouse clicks on the canvas correspond to a position in the
domain.

If our mapping approach is flexible and robust enough, we should be able to implement zooming and panning simply by
adjusting the mapping.

## Drawing the grid

The grid is infinite in size. There is no upper or lower limit to the horizontal or vertical position of a grid line.
However, we cannot draw an infinite number of lines. Instead, we need draw only those grid lines which are contained
within our viewport.

This is tricky, because our viewport specifies an area of the screen space, while our grid lines are specified in terms
of the domain space. Even if we understand that we can map between these two, how to do so in a way that solves this
problem is not obvious! Thinking in terms of two coordinate spaces is not a very natural or easy thing for human brains
to do, and can make your head hurt. This is not a sign of stupidity or inability, just a consequence of the difficulty
of the task itself. Sketching and diagramming can be a useful aide to thinking about this, but the only real solution
is patience, concentration, and practice.

A useful way to approach hard problems can be to solve a simpler problem first. Rather than trying to draw every grid
line, we'll instead try to draw a single vertical grid line.

We know that our viewport represents a window into our screen space, and that our screen space has a mapping to our
domain. Therefore, if we had a grid line, whose horizontal position was gx, then we could work out whether to draw it
or not by mapping gx from the domain to the screen space. This would give us an sx coordinate, and if it fell within
our viewport, e.g. it was higher than zero, and smaller than the width of the canvas, then we would need to draw it.

Since we can't check every horizontal grid line this way, we need some way to go in reverse. To start from the screen
and find a grid line that *would* be within it, if we checked. Working out how to do this is a the kind of puzzle that
lies at the heart of programming, but here's one approach:

1. Map the screen coordinate sx = 0 to the domain coordinate dx.
2. Find the grid line closest to dx with x coordinate gx.
3. Map gx *back* to the screen space as sgx.
4. Check whether sgx is within the viewport.
5. If it is, draw at vertical line at that position.


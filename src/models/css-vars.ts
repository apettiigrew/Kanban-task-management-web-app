/** Css breakpoints. Keep in sync with _media-queries.scss */
export enum BreakpointPlatform {
	phone = "phone",
	tabletPortrait = "tablet_p",
	tabletLandscape = "tablet_l",
	desktopSmall = "desktop_s",
	desktop = "desktop",
	highRes = "hr",
}

type BreakPoints = { [key in BreakpointPlatform]: number };

// -> Keep in sync width _media-queries.scss <-
const breakPointsAndPixels: BreakPoints = {
	[BreakpointPlatform.phone]: 370,
	[BreakpointPlatform.tabletPortrait]: 600,
	[BreakpointPlatform.tabletLandscape]: 900,
	[BreakpointPlatform.desktopSmall]: 1400,
	[BreakpointPlatform.desktop]: 1800,
	[BreakpointPlatform.highRes]: 2048,
};

/** Makes sure breakpoints are always sorted from highest to lowest for use in getCurrentBreakpointPlatform()
*/
const highestToLowestBreakpoints: { breakPoint: BreakpointPlatform, pixels: number }[] =
	Object.entries(breakPointsAndPixels).sort((a, b) => {
		const valueA = a[1];
		const valueB = b[1];

		if (valueA > valueB)
			return -1;
		if (valueA < valueB)
			return 1;
		else
			return 0;
	}).map((entry) => (
		{
			breakPoint: entry[0] as BreakpointPlatform,
			pixels: entry[1],
		}
	));

/** Helper function to get previous breakpoint before the one passed as the argument */
export function getPreviousBreakpoint(breakpoint: BreakpointPlatform): BreakpointPlatform {
	let index = 0;
	for (let i = 0; i < highestToLowestBreakpoints.length; i++) {
		const item = highestToLowestBreakpoints[i];
		if (item.breakPoint === breakpoint) {
			index = i;
			break;
		}
	}

	// Because it is ordered from highest to lowest, we add one instead of subtract one
	index += 1;
	if (index > highestToLowestBreakpoints.length - 1)
		index = highestToLowestBreakpoints.length - 1;

	return highestToLowestBreakpoints[index].breakPoint;
}

/** Helper function to get next breakpoint after the one passed as the argument */
export function getNextBreakpoint(breakpoint: BreakpointPlatform): BreakpointPlatform {
	let index = 0;
	for (let i = 0; i < highestToLowestBreakpoints.length; i++) {
		const item = highestToLowestBreakpoints[i];
		if (item.breakPoint === breakpoint) {
			index = i;
			break;
		}
	}

	// Because it is ordered from highest to lowest, we subtract one instead of add one
	index -= 1;
	if (index < 0)
		index = 0;

	return highestToLowestBreakpoints[index].breakPoint;
}

export function getBreakpointPixels(breakpoint: BreakpointPlatform) {
	return breakPointsAndPixels[breakpoint];
}

/** Returns current breakpoint based on window.innerWidth */
export function getCurrentBreakpointPlatform() {
	if (typeof window === "undefined") return BreakpointPlatform.phone;

	const innerwidth = window.innerWidth;

	for (let i = 0; i < highestToLowestBreakpoints.length; i++) {
		const bp = highestToLowestBreakpoints[i];
		if (innerwidth >= bp.pixels)
			return bp.breakPoint;
	}

	return BreakpointPlatform.phone;
}

type AppContainerWidthPercentages = { [key in BreakpointPlatform]: number }

// -> Keep in sync with _container.scss ! <-
const appContainerWidthPercentages: AppContainerWidthPercentages = {
	[BreakpointPlatform.phone]: 0.95,
	[BreakpointPlatform.tabletPortrait]: 0.9,
	[BreakpointPlatform.tabletLandscape]: 0.85,
	[BreakpointPlatform.desktopSmall]: 0.85,
	[BreakpointPlatform.desktop]: 0.8,
	[BreakpointPlatform.highRes]: 0.8,
};

/** Returns the app container width percentage at requested break point  */
export function getAppContainerWidthPercentageAtBreakpoint(bp: BreakpointPlatform) {
	return appContainerWidthPercentages[bp];
}

/** Is the current breakpoint greater or equal than breakpoint platform X? */
export function currentBreakpointGTE(bp: BreakpointPlatform) {
	if (typeof window === "undefined") return false;

	const breakPointPixels = getBreakpointPixels(bp);
	return window.innerWidth >= breakPointPixels;
}

// export function breakPointGTE(a: BreakpointPlatform, b: BreakpointPlatform) {
// 	const aPixels = getBreakpointPixels(a);
// 	const bPixels = getBreakpointPixels(b);
// 	return aPixels >= bPixels;
// }

/** Returns whether breakpoint is smaller than breakpoint b */
export function breakPointLT(a: BreakpointPlatform, b: BreakpointPlatform) {
	const aPixels = getBreakpointPixels(a);
	const bPixels = getBreakpointPixels(b);
	return aPixels < bPixels;
}
/** Returns whether breakpoint is smaller than breakpoint b */
export function breakPointGT(a: BreakpointPlatform, b: BreakpointPlatform) {
	const aPixels = getBreakpointPixels(a);
	const bPixels = getBreakpointPixels(b);
	return aPixels > bPixels;
}

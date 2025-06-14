import type { Request } from 'express'
import { lookup } from 'geoip-lite' // Library to look up location info based on IP
import * as countries from 'i18n-iso-countries' // Used to convert ISO country codes to readable names
import DeviceDetector = require('device-detector-js') // Detects device info from user-agent
import type { SessionMetadata } from '../types/session-metadata.types'
import { IS_DEV_ENV } from './is-dev.util' // Flag to detect if we're in development mode

// Register English locale to allow country name lookup
countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

/**
 * Extracts session metadata such as location, IP, and device info from the request.
 * 
 * @param req - Express request object
 * @param userAgent - The user-agent string from the client (browser/device)
 * @returns A structured SessionMetadata object
 */
export function getSessionMetadata(req: Request, userAgent: string): SessionMetadata {
	// 1. Determine the user's IP address
	// In dev, we use a fixed IP for consistent testing (you can change it to your own)
	const ip = IS_DEV_ENV
		? '173.166.164.121' // Development fallback IP (USA location)
		: Array.isArray(req.headers['cf-connecting-ip']) // Cloudflare forwarded IP (array)
			? req.headers['cf-connecting-ip'][0]
			: req.headers['cf-connecting-ip'] || // Cloudflare single forwarded IP
				(typeof req.headers['x-forwarded-for'] === 'string' // Other proxies may set this
					? req.headers['x-forwarded-for'].split(',')[0] // Use first IP from comma-separated list
					: req.ip) // Fallback to Express's req.ip

	// 2. Look up geographical location using IP
	const location = lookup(ip) // Returns object with country, city, lat/lng

	// 3. Parse the user-agent to get device/browser/OS info
	const device = new DeviceDetector().parse(userAgent)

	// 4. Build and return the SessionMetadata object
	return {
		location: {
			// Get full country name from country code, default to "Неизвестно" (unknown in Russian)
			country: countries.getName(location?.country, 'en') || 'Неизвестно',
			// Fallback to "Неизвестно" if city not available
			city: location?.city || 'Неизвестно',
			// Latitude & longitude from GeoIP data or fallback to 0
			latidute: location?.ll?.[0] || 0,
			longitude: location?.ll?.[1] || 0
		},
		device: {
			// Device/browser details, fallback to 'Unknown' if parsing fails
			browser: device?.client?.name || 'Unknown',
			os: device?.os?.name || 'Unknown',
			type: device?.device?.type || 'Unknown'
		},
		ip // Store original IP string
	}
}
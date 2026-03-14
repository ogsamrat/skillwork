// Quick test: can we import facinet?
try {
  const f = await import('facinet');
  console.log('facinet loaded OK, exports:', Object.keys(f));
} catch (e) {
  console.log('facinet import FAILED:', e.message);
}

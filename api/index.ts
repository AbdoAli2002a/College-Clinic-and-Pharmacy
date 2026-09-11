import handler from '../server';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function(req, res) {
  try {
    await handler(req, res);
  } catch (err) {
    res.status(500).json({ error: "API Route Error: " + err.message, stack: err.stack });
  }
}

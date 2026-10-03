import SentDm from "@sentdm/sentdm";
import logger from "../utils/logger.js";

class SentClient {
    constructor() {
        this.client = null;
        this.template = process.env.SENT_TEMPLATE_ID || "sent_Verify_Code_2"
    }
    initialize() {
        if(this.client) return this.client;

        try {
            this.client = new SentDm();
            return this.client;
        } catch (error) {
            logger.error("Sent init failed", error.message);
            throw error;
        }
    }

    /**
     * Send OTP using the correct parameters
     * The template parameter names must match exactly what's defined in Sent
     */
    async sendOTP(params) {
        try {
            const client = this.initialize();

            const templateParams = {
                var_1: params.otp,
            };

            if(params.expiryMinutes) {
                templateParams.var_2 = String(params.expiryMinutes);
            }

            const payload = {
                to: [params.to],
                template: {
                    name: this.template,
                    parameters:templateParams,
                },
                channel: ["sent"], // This enables WhatsApp + SMS routing
                // ADD THIS: Webhook Configuration
                webhook: {
                    url: this.webhookUrl,
                },
            };

            logger.debug(
                "Sending OTP with intelligent routing: ",
                JSON.stringify(payload, null, 2),
            );

            const response = await client.messages.send(payload);

            const recipient = response.data?.recipients?.[0];

            const messageId = recipient?.message_id || response.data?.id;
            const status = response.data?.status || "QUEUED";
            const selectedChannel = recipient?.channel || "sent_router";

            logger.info(
                `OTP sent to phone number via ${selectedChannel} (status: ${status})`,
            );

            return {
                ...response,
                messageId,
                status, 
                selectedChannel,
            };

        } catch (error) {
            if(error.status) {
                logger.error(`Sent API Error (${error.status}): ${error.message}`);
                if(error.error?.details) {
                    logger.error(
                        "Validation details:",
                        JSON.stringify(error.error.details, null, 2),
                    );
                }
            } else {
               logger.error("Failed to send OTP:", error.message || error); 
            }
            throw error;
        }
    }
}

export default new SentClient();
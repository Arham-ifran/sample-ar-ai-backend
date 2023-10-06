const { pythonBaseURL } = require("../../../config/vars");
const axios = require("axios");
const FormData = require("form-data");

//Get-Scripted-Text   /v1/front/text/scripted-text
exports.getScriptedText = async (req, res) => {
  try {
    const {
      body: { text },
    } = req;
    const url = `${pythonBaseURL}chat_gpt_result`;
    const form = new FormData();
    form.append("text", text);
    const {
      status = 0,
      data: { data, success },
    } = await axios.post(url, form);
    if (status === 200 && success) {
      // Send the Python API response data back to the user
      return res.status(200).send({
        data,
        success: true,
        message: "Script Received And Processed By Python API Successfully",
      });
    } else {
      return res.status(400).send({
        success: false,
        message: "Python API Failure",
      });
    }
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "An error occurred while processing the request",
    });
  }
};

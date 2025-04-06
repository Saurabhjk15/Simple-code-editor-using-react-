import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { LANGUAGE_VERSIONS, CODE_SNIPPETS } from "../constants";
import { getAvailableLanguages } from "../api";

const ACTIVE_COLOR = "blue.400";

const LanguageSelector = ({ language, onSelect }) => {
  const [availableLanguages, setAvailableLanguages] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const supported = await getAvailableLanguages();
        const filtered = Object.entries(LANGUAGE_VERSIONS)
          .filter(([lang]) => supported[lang] || CODE_SNIPPETS[lang])
          .sort((a, b) => a[0].localeCompare(b[0]));
        setAvailableLanguages(filtered);
      } catch (error) {
        console.error("Failed to load languages:", error);
        setAvailableLanguages(Object.entries(LANGUAGE_VERSIONS));
      } finally {
        setLoading(false);
      }
    };
    fetchLanguages();
  }, []);

  if (loading) {
    return (
      <Box ml={2} mb={4}>
        <Text mb={2} fontSize="lg">
          Language:
        </Text>
        <Spinner />
      </Box>
    );
  }
  return (
    <Box ml={2} mb={4}>
      <Text mb={2} fontSize="lg">
        Language:
      </Text>
      <Menu isLazy>
        <MenuButton as={Button}>{language}</MenuButton>
        <MenuList bg="#110c1b">
          {availableLanguages.map(([lang, version]) => (
            <MenuItem
              key={lang}
              color={lang === language ? ACTIVE_COLOR : ""}
              bg={lang === language ? "gray.900" : "transparent"}
              _hover={{
                color: ACTIVE_COLOR,
                bg: "gray.900",
              }}
              onClick={() => onSelect(lang)}
            >
              {lang}
              &nbsp;
              <Text as="span" color="gray.600" fontSize="sm">
                ({version})
              </Text>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};
export default LanguageSelector;
